
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// CORS headers for browser clients
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a function to send data to the external service (like Pluggy)
async function forwardToExternalService(payload: any) {
  try {
    console.log("Processing webhook data:", payload);
    
    // Here you would implement the logic to forward to Pluggy or other services
    // For now we just log it and return a success response
    
    return {
      success: true,
      message: "Data processed successfully",
      data: payload
    };
  } catch (error) {
    console.error("Error processing webhook data:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const requestUrl = new URL(req.url);
    console.log(`Received ${req.method} request to ${requestUrl.pathname}`);
    
    // Process webhook payload from n8n
    if (req.method === "POST") {
      const payload = await req.json();
      console.log("Webhook payload received:", payload);
      
      // Initialize Supabase client
      const supabaseUrl = "https://fhimpyxzedzildagctpq.supabase.co";
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Determine the company ID from the payload or URL params
      const empresa_id = payload.empresa_id || requestUrl.searchParams.get("empresa_id");
      
      if (!empresa_id) {
        return new Response(
          JSON.stringify({
            error: "Missing empresa_id in payload or as query parameter"
          }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }
      
      // Process the data
      const result = await forwardToExternalService(payload);
      
      // Store the webhook execution in the database
      await supabase.from("webhook_executions").insert({
        empresa_id,
        payload,
        result,
        source: "n8n",
        status: result.success ? "success" : "error"
      });
      
      // Return response
      return new Response(
        JSON.stringify(result),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: result.success ? 200 : 500 
        }
      );
    }
    
    // Handle GET requests (for testing the webhook)
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "online",
          message: "N8N webhook endpoint is active",
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }
    
    // Method not allowed
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405 
      }
    );
    
  } catch (error) {
    console.error("Error in webhook function:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});
