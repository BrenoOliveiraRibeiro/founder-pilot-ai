
import { getPluggyToken, callPluggyAPI, corsHeaders } from "./utils.ts";

export async function testPluggyConnection(pluggyClientId: string, pluggyClientSecret: string, sandbox: boolean, corsHeaders: Record<string, string>) {
  try {
    console.log("Testing Pluggy connection using current credentials...");
    
    // First, get authentication token
    console.log("Getting Pluggy API token");
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error("Failed basic API authentication test:", tokenResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Falha na autenticação básica com a API Pluggy",
          error: tokenResult.error,
          errorType: "authentication_failure",
          status: tokenResult.status
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    const apiKey = tokenResult.data.apiKey;
    console.log(`Successfully retrieved API token: ${apiKey.substring(0, 5)}...`);
    
    // Now, test by fetching available connectors
    console.log("Fetching available connectors...");
    const connectorsResult = await callPluggyAPI('/connectors?countries=BR', 'GET', apiKey);
    
    if (!connectorsResult.success) {
      console.error("Failed to fetch connectors:", connectorsResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Falha ao buscar conectores disponíveis",
          error: connectorsResult.error,
          errorType: "connectors_retrieval_failure"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Retrieved ${connectorsResult.data.total} connectors`);
    
    // Create a test connection
    const testConnector = connectorsResult.data.results.find(
      (c: any) => c.type === "PERSONAL_BANK" && c.country === "BR"
    ) || connectorsResult.data.results[0];
    
    if (!testConnector) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nenhum conector disponível para teste",
          errorType: "no_connectors_available"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Using test connector: ${testConnector.name} (${testConnector.id})`);
    
    // Create a test item (connection)
    const createItemResult = await callPluggyAPI('/items', 'POST', apiKey, {
      connectorId: testConnector.id,
      parameters: { user: 'user-test', password: 'password-test' }
    });
    
    if (!createItemResult.success) {
      console.error("Failed to create test item:", createItemResult.error);
      return new Response(
        JSON.stringify({
          success: true,
          message: "Conexão com a API Pluggy confirmada, mas falha ao criar item de teste",
          error: createItemResult.error,
          connectors: connectorsResult.data.results.slice(0, 5)
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Test item created: ${createItemResult.data.id}`);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Conexão com a API Pluggy realizada com sucesso",
        testItem: createItemResult.data.id,
        connectorsCount: connectorsResult.data.total,
        connectors: connectorsResult.data.results.slice(0, 5)
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Pluggy test connection failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Teste de conexão Pluggy falhou",
        error: error.message,
        errorType: "test_connection_failure"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
}
