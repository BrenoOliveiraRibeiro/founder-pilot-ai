
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { corsHeaders } from "./utils.ts";
import { testBelvoConnection } from "./test-connection.ts";
import { authorizeConnection } from "./authorize.ts";
import { processCallback } from "./callback.ts";
import { syncData } from "./sync-data.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const belvoSecretId = Deno.env.get("BELVO_SECRET_ID") || "";
    const belvoSecretPassword = Deno.env.get("BELVO_SECRET_PASSWORD") || "";

    console.log("Using Belvo credentials - ID:", belvoSecretId ? belvoSecretId.substring(0, 5) + "***" : "not set");
    console.log("Password length:", belvoSecretPassword ? belvoSecretPassword.length : "not set");

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { action, empresa_id, institution, link_id, sandbox = true } = requestData;

    if (!empresa_id && action !== "test_connection") {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Route to appropriate handler based on action
    switch (action) {
      case "test_connection":
        return await testBelvoConnection(belvoSecretId, belvoSecretPassword, sandbox, corsHeaders);
      
      case "authorize":
        return await authorizeConnection(
          empresa_id, 
          institution, 
          sandbox, 
          belvoSecretId, 
          belvoSecretPassword, 
          corsHeaders
        );
      
      case "callback":
        return await processCallback(
          empresa_id, 
          link_id, 
          sandbox, 
          belvoSecretId, 
          belvoSecretPassword, 
          supabase, 
          corsHeaders
        );
      
      case "sync":
        return await syncData(
          empresa_id, 
          requestData.integration_id, 
          sandbox, 
          belvoSecretId, 
          belvoSecretPassword, 
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
