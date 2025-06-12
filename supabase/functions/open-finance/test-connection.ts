
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function testPluggyConnection(
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  sandbox: boolean, 
  corsHeaders: Record<string, string>
) {
  console.log("Testando conexão com Pluggy...");
  
  try {
    // Test authentication
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Falha na autenticação: ${tokenResult.error?.message}`,
          error: tokenResult.error
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Test API access with connectors endpoint
    const connectorsResult = await callPluggyAPI('/connectors', 'GET', tokenResult.data!.apiKey, null, sandbox);
    
    if (!connectorsResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          message: `Falha no acesso à API: ${connectorsResult.error?.message}`,
          error: connectorsResult.error
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Conexão com Pluggy estabelecida com sucesso",
        connectorsCount: connectorsResult.data?.results?.length || 0,
        sandbox: sandbox
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Erro no teste de conexão:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: "Erro interno no teste de conexão",
        error: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
