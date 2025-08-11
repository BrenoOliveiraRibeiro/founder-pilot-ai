
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { corsHeaders } from "./utils.ts";
import { testPluggyConnection } from "./test-connection.ts";
import { authorizeConnection } from "./authorize.ts";
import { processCallback } from "./callback.ts";
import { syncData } from "./sync-data.ts";
import { processFinancialData } from "./financial-data.ts";

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
        JSON.stringify({ 
          error: "Empresa ID é obrigatório",
          message: "O ID da empresa deve ser fornecido para esta operação"
        }),
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
        return new Response(
          JSON.stringify({ 
            error: "Ação não suportada",
            message: `A ação "${action}" não é reconhecida pelo sistema`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Erro na função de Open Finance:", error);
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
