
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { corsHeaders } from "./utils.ts";
import { testPluggyConnection } from "./test-connection.ts";
import { authorizeConnection } from "./authorize.ts";
import { processCallback } from "./callback.ts";
import { syncData } from "./sync-data.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Use your specific Supabase and Pluggy credentials
    const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const pluggyClientId = "129bdd30-a6c1-40ce-afbb-ad38d7a993c0";
    const pluggyClientSecret = "c93c4fb3-7c9a-4aa9-8358-9e2c562f94a7";

    console.log("Using Pluggy credentials - ID:", pluggyClientId ? pluggyClientId.substring(0, 8) + "***" : "not set");
    console.log("Client Secret length:", pluggyClientSecret ? pluggyClientSecret.length : "not set");

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { action, empresa_id, institution, item_id, sandbox = true } = requestData;

    if (!empresa_id && action !== "test_connection") {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Route to appropriate handler based on action
    switch (action) {
      case "test_connection":
        return await testPluggyConnection(pluggyClientId, pluggyClientSecret, sandbox, corsHeaders);
      
      case "authorize":
        return await authorizeConnection(
          empresa_id, 
          institution, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          corsHeaders
        );
      
      case "callback":
        return await processCallback(
          empresa_id, 
          item_id, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          supabase, 
          corsHeaders
        );
      
      case "sync":
        return await syncData(
          empresa_id, 
          requestData.integration_id, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          supabase, 
          corsHeaders
        );

      case "process_financial_data":
        return await processFinancialDataDirectly(
          empresa_id,
          requestData.item_id,
          requestData.account_id,
          requestData.transactions_data,
          sandbox,
          supabase,
          corsHeaders
        );
      
      default:
        return new Response(
          JSON.stringify({ error: "Ação não suportada" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro na função de Open Finance:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor", 
        message: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function processFinancialDataDirectly(
  empresaId: string,
  itemId: string,
  accountId: string,
  transactionsData: any,
  sandbox: boolean,
  supabase: any,
  corsHeaders: Record<string, string>
) {
  console.log(`Processando dados financeiros diretamente - Empresa: ${empresaId}, Item: ${itemId}, Account: ${accountId}`);
  
  try {
    if (!transactionsData || !transactionsData.results || !Array.isArray(transactionsData.results)) {
      return new Response(
        JSON.stringify({ error: "Dados de transações inválidos" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const transactions = transactionsData.results;
    console.log(`Processando ${transactions.length} transações`);

    // Preparar dados das transações para inserção na tabela 'transacoes'
    const transacoesParaInserir = transactions.map((tx: any) => ({
      empresa_id: empresaId,
      descricao: tx.description || 'Transação',
      valor: tx.amount || 0,
      data_transacao: tx.date,
      categoria: tx.category || 'Outros',
      tipo: tx.amount > 0 ? 'receita' : 'despesa',
      metodo_pagamento: tx.type || 'Transferência',
      recorrente: false // Pode ser determinado através de análise posterior
    }));

    // Inserir transações na tabela 'transacoes'
    const { data: insertedData, error: insertError } = await supabase
      .from("transacoes")
      .insert(transacoesParaInserir)
      .select();

    if (insertError) {
      console.error("Erro ao inserir transações:", insertError);
      throw insertError;
    }

    console.log(`${transacoesParaInserir.length} transações salvas com sucesso na tabela 'transacoes'`);

    // Calcular métricas básicas
    const receitas = transactions.filter((tx: any) => tx.amount > 0);
    const despesas = transactions.filter((tx: any) => tx.amount < 0);
    
    const totalReceitas = receitas.reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0);
    const totalDespesas = Math.abs(despesas.reduce((sum: number, tx: any) => sum + tx.amount, 0));
    const saldoLiquido = totalReceitas - totalDespesas;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Transações processadas e salvas com sucesso na tabela 'transacoes'",
        data: {
          transacoes_salvas: transacoesParaInserir.length,
          total_receitas: totalReceitas,
          total_despesas: totalDespesas,
          saldo_liquido: saldoLiquido,
          inserted_data: insertedData
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Erro ao processar dados financeiros:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar dados financeiros", 
        message: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
