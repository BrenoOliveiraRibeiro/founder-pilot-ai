
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
    // Use your specific Supabase and Pluggy credentials from environment variables
    const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const pluggyClientId = Deno.env.get("PLUGGY_CLIENT_ID") || "";
    const pluggyClientSecret = Deno.env.get("PLUGGY_CLIENT_SECRET") || "";

    console.log("Using Pluggy credentials - ID:", pluggyClientId ? pluggyClientId.substring(0, 8) + "***" : "not set");
    console.log("Client Secret length:", pluggyClientSecret ? pluggyClientSecret.length : "not set");

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { 
      action, 
      empresa_id, 
      institution, 
      item_id,
      code, // For OAuth flow
      redirectUri, // For OAuth flow  
      integration_id, 
      sandbox = true 
    } = requestData;

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
          redirectUri // Pass through the redirectUri for OAuth flow
        );
      
      case "callback":
        return await processCallback(
          empresa_id, 
          item_id,
          code, // Pass the authorization code for OAuth flow
          redirectUri, // Pass the redirectUri for OAuth flow
          sandbox, 
          pluggyClientId, 
          pluggyClientSecret, 
          supabase
        );
      
      case "sync":
        return await syncData(
          empresa_id, 
          integration_id, 
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
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
