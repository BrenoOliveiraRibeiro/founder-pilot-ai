
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

/**
 * Testa a conexão com a API do Pluggy
 * @param pluggyClientId ID do cliente Pluggy
 * @param pluggyClientSecret Chave secreta do cliente Pluggy
 * @param sandbox Indica se deve usar o ambiente de sandbox
 * @param corsHeaders Cabeçalhos CORS para a resposta
 */
export async function testPluggyConnection(
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  sandbox: boolean, 
  corsHeaders: Record<string, string>
) {
  console.log(`Testing Pluggy connection in ${sandbox ? 'sandbox' : 'production'} mode...`);
  
  try {
    // Validar parâmetros de entrada
    if (!pluggyClientId || !pluggyClientSecret) {
      console.error("Missing Pluggy credentials");
      return createErrorResponse(
        "Credenciais do Pluggy não configuradas", 
        { message: "Missing Pluggy client ID or secret" }, 
        corsHeaders, 
        400
      );
    }
    
    // Testar autenticação com Pluggy
    console.log("Authenticating with Pluggy API...");
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error("Authentication with Pluggy failed:", tokenResult.error);
      return createErrorResponse(
        "Falha na autenticação com a API Pluggy", 
        tokenResult.error, 
        corsHeaders, 
        401
      );
    }
    
    const apiKey = tokenResult.data.apiKey;
    console.log("Pluggy authentication successful, retrieving connectors...");
    
    // Testar listagem de conectores
    const connectorsResult = await callPluggyAPI('/connectors', 'GET', apiKey);
    
    if (!connectorsResult.success) {
      console.error("Failed to retrieve connectors:", connectorsResult.error);
      return createErrorResponse(
        "Falha ao listar conectores", 
        connectorsResult.error, 
        corsHeaders, 
        500
      );
    }
    
    const connectors = connectorsResult.data.results || [];
    console.log(`Found ${connectors.length} connectors`);
    
    // Retornar resposta de sucesso
    return createSuccessResponse({
      success: true, 
      message: "Conexão com o Pluggy estabelecida com sucesso",
      connectorsCount: connectors.length
    }, corsHeaders);
    
  } catch (error) {
    console.error("Error testing Pluggy connection:", error);
    return createErrorResponse(
      "Erro ao testar conexão com Pluggy", 
      { message: error.message || "Unknown error" }, 
      corsHeaders, 
      500
    );
  }
}

/**
 * Cria uma resposta de sucesso padronizada
 */
function createSuccessResponse(data: any, corsHeaders: Record<string, string>, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status 
    }
  );
}

/**
 * Cria uma resposta de erro padronizada
 */
function createErrorResponse(
  message: string, 
  details: any, 
  corsHeaders: Record<string, string>, 
  status: number = 500
) {
  return new Response(
    JSON.stringify({ 
      success: false, 
      message, 
      details 
    }),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" }, 
      status 
    }
  );
}
