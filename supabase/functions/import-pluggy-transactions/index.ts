
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: "CREDIT" | "DEBIT";
  accountId: string;
  currencyCode?: string;
  merchant?: {
    name?: string;
  };
}

interface PluggyResponse {
  total: number;
  totalPages: number;
  page: number;
  results: PluggyTransaction[];
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseServiceKey) {
      throw new Error("Chave de serviço do Supabase não configurada");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { empresa_id, account_id } = requestData;

    if (!empresa_id) {
      return new Response(
        JSON.stringify({ error: "empresa_id é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Iniciando importação de transações para empresa ${empresa_id}`);

    // Buscar token da Pluggy (assumindo que já existe uma integração ativa)
    const { data: integration, error: integrationError } = await supabase
      .from("integracoes_bancarias")
      .select("detalhes")
      .eq("empresa_id", empresa_id)
      .eq("tipo_conexao", "Open Finance")
      .eq("status", "ativa")
      .single();

    if (integrationError || !integration) {
      throw new Error("Integração bancária não encontrada ou inativa");
    }

    const apiKey = integration.detalhes?.api_key;
    if (!apiKey) {
      throw new Error("Token da API não encontrado na integração");
    }

    let allTransactions: PluggyTransaction[] = [];
    let page = 1;
    let totalPages = 1;

    // Buscar todas as transações com paginação
    do {
      console.log(`Buscando página ${page} de ${totalPages}`);
      
      let url = `https://api.pluggy.ai/transactions?page=${page}`;
      if (account_id) {
        url += `&accountId=${account_id}`;
      }

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API da Pluggy: ${response.status} - ${response.statusText}`);
      }

      const data: PluggyResponse = await response.json();
      allTransactions = allTransactions.concat(data.results);
      totalPages = data.totalPages;
      page++;

    } while (page <= totalPages);

    console.log(`Total de transações encontradas: ${allTransactions.length}`);

    // Transformar transações da Pluggy para o formato da tabela
    const transacoesToInsert = allTransactions.map(transaction => {
      // Determinar tipo baseado no amount e type
      let tipo: 'receita' | 'despesa';
      if (transaction.type === 'CREDIT' || transaction.amount > 0) {
        tipo = 'receita';
      } else {
        tipo = 'despesa';
      }

      // Usar valor absoluto para que sempre seja positivo na tabela
      const valor = Math.abs(transaction.amount);

      // Mapear categoria ou usar descrição do merchant se disponível
      let categoria = transaction.category || 'Outros';
      if (transaction.merchant?.name) {
        categoria = transaction.merchant.name;
      }

      return {
        empresa_id: empresa_id,
        descricao: transaction.description,
        valor: valor,
        data_transacao: transaction.date.split('T')[0], // Extrair apenas a data
        categoria: categoria,
        tipo: tipo,
        metodo_pagamento: transaction.currencyCode === 'BRL' ? 'Transferência' : 'Internacional',
        recorrente: false
      };
    });

    console.log(`Preparando inserção de ${transacoesToInsert.length} transações`);

    // Verificar duplicatas baseadas na descrição, valor e data
    const { data: existingTransactions } = await supabase
      .from("transacoes")
      .select("descricao, valor, data_transacao")
      .eq("empresa_id", empresa_id);

    const existingSet = new Set(
      (existingTransactions || []).map(t => 
        `${t.descricao}-${t.valor}-${t.data_transacao}`
      )
    );

    const newTransactions = transacoesToInsert.filter(t => 
      !existingSet.has(`${t.descricao}-${t.valor}-${t.data_transacao}`)
    );

    console.log(`${newTransactions.length} transações novas para inserir`);

    if (newTransactions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhuma transação nova encontrada",
          total_processadas: allTransactions.length,
          novas_inseridas: 0,
          duplicatas_ignoradas: transacoesToInsert.length
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Inserir transações em lotes para evitar timeouts
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < newTransactions.length; i += batchSize) {
      const batch = newTransactions.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from("transacoes")
        .insert(batch);

      if (insertError) {
        console.error(`Erro ao inserir lote ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }

      insertedCount += batch.length;
      console.log(`Lote ${i / batchSize + 1} inserido com sucesso (${batch.length} transações)`);
    }

    // Atualizar timestamp da última sincronização
    await supabase
      .from("integracoes_bancarias")
      .update({ ultimo_sincronismo: new Date().toISOString() })
      .eq("empresa_id", empresa_id)
      .eq("tipo_conexao", "Open Finance");

    console.log(`Importação concluída: ${insertedCount} transações inseridas`);

    return new Response(
      JSON.stringify({
        message: "Transações importadas com sucesso",
        total_processadas: allTransactions.length,
        novas_inseridas: insertedCount,
        duplicatas_ignoradas: transacoesToInsert.length - insertedCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Erro na importação:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro na importação de transações",
        message: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
