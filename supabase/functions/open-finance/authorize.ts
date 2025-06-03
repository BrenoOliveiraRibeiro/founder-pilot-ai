
import { corsHeaders, getPluggyToken } from "./utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

export async function authorizeConnection(
  empresa_id: string,
  institution: string | null,
  sandbox: boolean,
  pluggyClientId: string,
  pluggyClientSecret: string,
  redirectUri?: string
) {
  try {
    console.log(`Initializing connection for empresa ${empresa_id}, institution: ${institution || 'Not specified'}, sandbox: ${sandbox}`);
    
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
    
    // If we have redirectUri, we're doing OAuth flow
    if (redirectUri) {
      console.log(`Creating OAuth URL with redirectUri: ${redirectUri}`);
      
      // For OAuth flow, create authorization URL following official documentation
      // URL: https://api.pluggy.ai/auth with correct parameters
      const authUrl = `https://api.pluggy.ai/auth` + 
        `?response_type=code` + // Obrigatório conforme documentação
        `&client_id=${encodeURIComponent(pluggyClientId)}` + // client_id em vez de clientId
        `&redirect_uri=${encodeURIComponent(redirectUri)}` + // redirect_uri em vez de redirectUri
        `&scope=read_accounts read_transactions` + // Escopo para contas PJ
        (institution ? `&connector_id=${encodeURIComponent(institution)}` : '');
      
      console.log("Authorization URL created:", authUrl);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          authUrl 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      // For widget flow, create connect token
      console.log("Creating connect token for widget flow");
      
      const connectTokenResponse = await fetch(`https://api.pluggy.ai/connect_token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": apiKey
        },
        body: JSON.stringify({
          itemId: null,
          includeSandbox: sandbox
        })
      });
      
      if (!connectTokenResponse.ok) {
        const errorText = await connectTokenResponse.text();
        console.error("Error getting connect token:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to get connect token", details: errorText }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: connectTokenResponse.status }
        );
      }
      
      const connectTokenData = await connectTokenResponse.json();
      console.log("Connect token created successfully");
      
      return new Response(
        JSON.stringify({
          success: true,
          connect_token: connectTokenData.accessToken
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in authorization process:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to authorize with Pluggy",
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
