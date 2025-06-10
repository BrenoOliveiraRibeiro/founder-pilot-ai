
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function testPluggyConnection(pluggyClientId: string, pluggyClientSecret: string, sandbox: boolean, corsHeaders: Record<string, string>) {
  console.log("Testing Pluggy connection...");
  
  try {
    // Test authentication with Pluggy
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error("Authentication with Pluggy failed:", tokenResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Falha na autenticação com a API Pluggy",
          details: tokenResult.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const apiKey = tokenResult.data.apiKey;
    console.log("Pluggy authentication successful, retrieving connectors...");
    
    // Test listing connectors
    const connectorsResult = await callPluggyAPI('/connectors', 'GET', apiKey);
    
    if (!connectorsResult.success) {
      console.error("Failed to retrieve connectors:", connectorsResult.error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Falha ao listar conectores",
          details: connectorsResult.error
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const connectors = connectorsResult.data.results || [];
    console.log(`Found ${connectors.length} connectors`);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Conexão com o Pluggy estabelecida com sucesso",
        connectorsCount: connectors.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Error testing Pluggy connection:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Erro ao testar conexão com Pluggy", 
        details: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
