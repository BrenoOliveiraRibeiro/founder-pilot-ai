
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { corsHeaders } from "./utils.ts";
import { testPluggyConnection } from "./test-connection.ts";
import { authorizeConnection } from "./authorize.ts";
import { processCallback } from "./callback.ts";
import { syncData } from "./sync-data.ts";
import { processFinancialData } from "./financial-data.ts";

serve(async (req) => {
  console.log(`🚀 [INDEX] Nova requisição recebida: ${req.method} ${req.url}`);
  
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    console.log(`✅ [INDEX] Respondendo CORS preflight`);
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

    console.log(`📦 [INDEX] Tentando fazer parse do JSON da requisição...`);
    
    let requestData;
    try {
      requestData = await req.json();
      console.log(`✅ [INDEX] JSON parseado com sucesso:`, JSON.stringify(requestData, null, 2));
    } catch (parseError) {
      console.error(`❌ [INDEX] Erro ao fazer parse do JSON:`, parseError);
      return new Response(
        JSON.stringify({ 
          error: "Erro ao fazer parse do JSON da requisição",
          message: parseError.message
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { action, empresa_id, institution, item_id, sandbox = true } = requestData;
    
    console.log(`🎯 [INDEX] Parâmetros extraídos:`, {
      action: action,
      empresa_id: empresa_id,
      institution: institution,
      item_id: item_id,
      sandbox: sandbox,
      integration_id: requestData.integration_id
    });

    if (!empresa_id && action !== "test_connection") {
      console.error(`❌ [INDEX] Empresa ID é obrigatório para action: ${action}`);
      return new Response(
        JSON.stringify({ 
          error: "Empresa ID é obrigatório",
          message: "O ID da empresa deve ser fornecido para esta operação"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`🔀 [INDEX] Entrando no switch com action: "${action}"`);

    // Route to appropriate handler based on action
    switch (action) {
      case "test_connection":
        console.log(`🧪 [INDEX] Executando test_connection`);
        return await testPluggyConnection(pluggyClientId, pluggyClientSecret, sandbox, corsHeaders);
      
      case "authorize":
        console.log(`🔐 [INDEX] Executando authorize`);
        return await authorizeConnection(
          empresa_id, 
          institution, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          corsHeaders
        );
      
      case "callback":
        console.log(`📞 [INDEX] Executando callback`);
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
        console.log(`🔄 [INDEX] Executando SYNC - Parâmetros para syncData:`);
        console.log(`   - empresa_id: ${empresa_id}`);
        console.log(`   - integration_id: ${requestData.integration_id}`);
        console.log(`   - sandbox: ${sandbox}`);
        console.log(`   - pluggyClientId: ${pluggyClientId ? 'PRESENTE' : 'AUSENTE'}`);
        console.log(`   - pluggyClientSecret: ${pluggyClientSecret ? 'PRESENTE' : 'AUSENTE'}`);
        
        console.log(`🚀 [INDEX] Chamando função syncData...`);
        const syncResult = await syncData(
          empresa_id, 
          requestData.integration_id, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          supabase, 
          corsHeaders
        );
        console.log(`✅ [INDEX] syncData retornou:`, syncResult.status, syncResult.statusText);
        return syncResult;

      case "process_financial_data":
        console.log(`💰 [INDEX] Executando process_financial_data`);
        console.log(`Processando dados financeiros - Empresa: ${empresa_id}, Item: ${requestData.item_id}, Account: ${requestData.account_id}`);
        
        try {
          // 1. Validar se a empresa existe primeiro
          console.log(`Validando existência da empresa: ${empresa_id}`);
          const { data: empresa, error: empresaError } = await supabase
            .from('empresas')
            .select('id, nome')
            .eq('id', empresa_id)
            .single();

          if (empresaError || !empresa) {
            console.error("Empresa não encontrada:", empresaError);
            return new Response(
              JSON.stringify({ 
                error: "Empresa não encontrada", 
                message: `Empresa com ID ${empresa_id} não existe no banco de dados`,
                empresa_id: empresa_id
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
            );
          }

          console.log(`Empresa encontrada: ${empresa.nome} (ID: ${empresa.id})`);

          // 2. Usar processFinancialData
          const result = await processFinancialData(
            empresa_id,
            requestData.item_id,
            requestData.account_id,
            requestData.transactions_data,
            null, // apiKey será obtido dentro da função
            pluggyClientId,
            pluggyClientSecret,
            sandbox,
            supabase
          );

          return new Response(
            JSON.stringify({ 
              success: true, 
              message: result.message,
              data: {
                empresa_nome: empresa.nome,
                empresa_id: empresa_id,
                newTransactions: result.newTransactions,
                duplicates: result.duplicates,
                total: result.total
              },
              newTransactions: result.newTransactions,
              duplicates: result.duplicates
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );

        } catch (error: any) {
          console.error("Erro ao processar dados financeiros:", error);
          return new Response(
            JSON.stringify({ 
              error: "Falha ao processar dados financeiros", 
              message: error.message || "Erro interno do servidor",
              stack: error.stack
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
      
      default:
        console.error(`❌ [INDEX] Ação não reconhecida: "${action}"`);
        return new Response(
          JSON.stringify({ 
            error: "Ação não suportada",
            message: `A ação "${action}" não é reconhecida pelo sistema`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error: any) {
    console.error("💥 [INDEX] Erro geral na função de Open Finance:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor", 
        message: error.message || "Erro desconhecido",
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
