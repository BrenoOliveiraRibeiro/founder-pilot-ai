
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { corsHeaders } from "./utils.ts";
import { testPluggyConnection } from "./test-connection.ts";
import { authorizeConnection } from "./authorize.ts";
import { processCallback } from "./callback.ts";
import { syncData } from "./sync-data.ts";

serve(async (req) => {
  console.log("=== Edge Function Open Finance Request ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);

  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    // Environment validation
    console.log("Environment check:");
    const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID");
    const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET");

    console.log("- Supabase URL:", supabaseUrl);
    console.log("- Service Key available:", !!supabaseServiceKey);
    console.log("- Pluggy Client ID available:", !!pluggyClientId);
    console.log("- Pluggy Client Secret available:", !!pluggyClientSecret);

    if (!supabaseServiceKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurado");
    }

    if (!pluggyClientId || !pluggyClientSecret) {
      throw new Error("Credenciais Pluggy não configuradas");
    }

    const requestData = await req.json();
    console.log("Request data:", requestData);

    const { action, empresa_id, institution, item_id, sandbox = true } = requestData;

    if (!empresa_id && action !== "test_connection") {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        console.log("Processando callback");
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
        console.log("Sincronizando dados");
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
