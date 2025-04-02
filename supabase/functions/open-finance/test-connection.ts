import { callBelvoAPI } from "./utils.ts";

export async function testBelvoConnection(belvoSecretId: string, belvoSecretPassword: string, sandbox: boolean, corsHeaders: Record<string, string>) {
  try {
    console.log("Testing Belvo connection using current credentials...");
    
    // First, try to get institutions to verify auth
    console.log("Verifying credentials with GET /api/institutions/ call");
    const institutionsResult = await callBelvoAPI('/api/institutions/', 'GET', belvoSecretId, belvoSecretPassword, sandbox);
    
    if (!institutionsResult.success) {
      console.error("Failed basic API authentication test:", institutionsResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Falha na autenticação básica com a API Belvo",
          error: institutionsResult.error,
          errorType: "authentication_failure",
          status: institutionsResult.status
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Successfully retrieved ${institutionsResult.data.count} institutions`);
    
    // If authentication works, proceed to test link creation
    console.log("Creating test link using sandbox credentials...");
    
    // Get the first institution available in sandbox for testing
    let testInstitution = 'erebor_br_retail'; // Default fallback
    
    if (institutionsResult.data.results && institutionsResult.data.results.length > 0) {
      // Try to find a Brazilian institution first
      const brInstitution = institutionsResult.data.results.find((inst: any) => 
        inst.country_code === 'BR' || (inst.country_codes && inst.country_codes.includes('BR'))
      );
      
      if (brInstitution) {
        testInstitution = brInstitution.name;
      } else {
        // Otherwise use the first available
        testInstitution = institutionsResult.data.results[0].name;
      }
    }
    
    console.log(`Using test institution: ${testInstitution}`);
    
    const createLinkResult = await callBelvoAPI('/api/links/', 'POST', belvoSecretId, belvoSecretPassword, sandbox, {
      institution: testInstitution,
      username: 'fake-user',
      password: 'fake-password', 
      access_mode: 'single'
    });
    
    if (!createLinkResult.success) {
      console.error("Failed to create test link:", createLinkResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Falha ao criar link de teste",
          error: createLinkResult.error,
          errorType: "test_link_failure"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log("Test link created:", createLinkResult.data.id);
    
    // Retrieve accounts for this link
    const accountsResult = await callBelvoAPI(`/api/accounts/?link=${createLinkResult.data.id}`, 'GET', belvoSecretId, belvoSecretPassword, sandbox);
    
    if (!accountsResult.success) {
      console.error("Failed to retrieve accounts:", accountsResult.error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Falha ao recuperar contas de teste",
          error: accountsResult.error,
          errorType: "accounts_retrieval_failure"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Retrieved ${accountsResult.data.count} test accounts`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Conexão com a API Belvo realizada com sucesso",
        testLink: createLinkResult.data.id,
        accountsCount: accountsResult.data.count,
        accounts: accountsResult.data.results.slice(0, 2) // Return first 2 accounts as sample
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Belvo test connection failed:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Teste de conexão Belvo falhou",
        error: error.message,
        errorType: "test_link_failure"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
}
