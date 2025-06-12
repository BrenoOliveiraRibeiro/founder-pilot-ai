
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
    console.log("=== Edge Function Open Finance Request ===");
    console.log("Method:", req.method);
    console.log("URL:", req.url);
    
    // Use your specific Supabase and Pluggy credentials
    const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Get Pluggy credentials from Supabase secrets
    const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
    const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

    console.log("Environment check:");
    console.log("- Supabase URL:", supabaseUrl);
    console.log("- Service Key available:", !!supabaseServiceKey);
    console.log("- Pluggy Client ID available:", !!pluggyClientId);
    console.log("- Pluggy Client Secret available:", !!pluggyClientSecret);
    
    if (!supabaseServiceKey) {
      console.error("Missing Supabase Service Role Key");
      return new Response(
        JSON.stringify({ 
          error: "Configuração do servidor incompleta",
          details: "SUPABASE_SERVICE_ROLE_KEY não encontrada"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (!pluggyClientId || !pluggyClientSecret) {
      console.error("Missing Pluggy credentials");
      return new Response(
        JSON.stringify({ 
          error: "Credenciais da Pluggy não configuradas",
          details: "PLUGGY_CLIENT_ID ou PLUGGY_CLIENT_SECRET não encontrados"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { action, empresa_id, institution, item_id, sandbox = true } = requestData;

    console.log("Request data:", { action, empresa_id, institution, item_id, sandbox });

    if (!empresa_id && action !== "test_connection") {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Route to appropriate handler based on action
    switch (action) {
      case "test_connection":
        console.log("Executando teste de conexão");
        return await testPluggyConnection(pluggyClientId, pluggyClientSecret, sandbox, corsHeaders);
      
      case "authorize":
        console.log("Executando autorização");
        return await authorizeConnection(
          empresa_id, 
          institution, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          corsHeaders
        );
      
      case "callback":
        console.log("Executando callback");
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
        console.log("Executando sincronização");
        return await syncData(
          empresa_id, 
          requestData.integration_id, 
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          supabase, 
          corsHeaders
        );
      
      default:
        console.error("Ação não suportada:", action);
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
