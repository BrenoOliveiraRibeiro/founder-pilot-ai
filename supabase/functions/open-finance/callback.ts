
import { corsHeaders, getPluggyToken } from "./utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { gerarInsights } from "./utils.ts";

export async function processCallback(
  empresa_id: string,
  item_id: string | null,
  code: string | null,
  redirectUri: string | null,
  sandbox: boolean,
  pluggyClientId: string,
  pluggyClientSecret: string,
  supabaseClient: any
) {
  try {
    console.log(`Processing callback for empresa ${empresa_id}`);
    
    // Get Pluggy API token
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error("Failed to get Pluggy API token:", tokenResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Failed to authenticate with Pluggy", 
          details: tokenResult.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const apiKey = tokenResult.data.apiKey;
    
    // Handle OAuth flow if code is provided
    if (code && redirectUri) {
      console.log(`Processing OAuth callback with code: ${code.substring(0, 5)}...`);
      
      // Exchange authorization code for access token
      const tokenResponse = await fetch(`${sandbox ? 'https://api.pluggy.ai' : 'https://api.pluggy.ai'}/connect/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify({
          code,
          redirectUri
        })
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Error exchanging code for token:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to exchange authorization code", details: errorText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: tokenResponse.status }
        );
      }
      
      const tokenData = await tokenResponse.json();
      console.log("Successfully exchanged code for item data");
      
      // Use the itemId from the response
      item_id = tokenData.item.id;
    }
    
    if (!item_id) {
      return new Response(
        JSON.stringify({ error: "No item_id provided" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing item: ${item_id}`);
    
    // Retrieve item details
    const itemResponse = await fetch(`${sandbox ? 'https://api.pluggy.ai' : 'https://api.pluggy.ai'}/items/${item_id}`, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey
      }
    });

    if (!itemResponse.ok) {
      const errorText = await itemResponse.text();
      console.error("Error fetching item details:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch item details", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: itemResponse.status }
      );
    }

    const itemData = await itemResponse.json();
    console.log(`Item details retrieved for ${itemData.connector.name}`);

    // Retrieve accounts
    const accountsResponse = await fetch(`${sandbox ? 'https://api.pluggy.ai' : 'https://api.pluggy.ai'}/accounts?itemId=${item_id}`, {
      method: "GET",
      headers: {
        "X-API-KEY": apiKey
      }
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      console.error("Error fetching accounts:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch accounts", details: errorText }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: accountsResponse.status }
      );
    }

    const accountsData = await accountsResponse.json();
    console.log(`Retrieved ${accountsData.results.length} accounts`);

    // Store integration in database
    const { data: integrationData, error: integrationError } = await supabaseClient
      .from("integracoes_bancarias")
      .insert({
        empresa_id,
        nome_banco: itemData.connector.name,
        tipo_conexao: "Open Finance",
        status: itemData.status,
        ultimo_sincronismo: new Date().toISOString(),
        detalhes: {
          item_id: item_id,
          connector_id: itemData.connector.id,
          accounts: accountsData.results,
          connector: itemData.connector
        }
      })
      .select()
      .single();

    if (integrationError) {
      console.error("Error storing integration:", integrationError);
      return new Response(
        JSON.stringify({ error: "Failed to store integration data", details: integrationError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Integration stored successfully:", integrationData.id);

    // Start syncing financial data
    const syncResponse = await fetch(`https://fhimpyxzedzildagctpq.supabase.co/functions/v1/open-finance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      },
      body: JSON.stringify({
        action: "sync",
        empresa_id,
        integration_id: integrationData.id,
        sandbox
      })
    });

    if (!syncResponse.ok) {
      console.warn("Failed to trigger data sync, but connection was successful:", await syncResponse.text());
    } else {
      console.log("Data sync initiated successfully");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Integration successful",
        integration_id: integrationData.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing callback:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process callback",
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
