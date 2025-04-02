
import { callBelvoAPI } from "./utils.ts";

export async function authorizeConnection(empresaId: string, institution: string, sandbox: boolean, belvoSecretId: string, belvoSecretPassword: string, corsHeaders: Record<string, string>) {
  console.log(`Iniciando autorização para empresa ${empresaId} com ${institution} (sandbox: ${sandbox})`);
  
  // Primeiro, vamos validar o acesso à API Belvo com uma chamada simples
  try {
    const institutionsResult = await callBelvoAPI('/api/institutions/', 'GET', belvoSecretId, belvoSecretPassword, sandbox);
    if (!institutionsResult.success) {
      console.error("Erro na validação de acesso à API Belvo:", institutionsResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Falha na autenticação com a API Belvo. Verifique suas credenciais.",
          details: institutionsResult.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    console.log(`Instituições disponíveis: ${institutionsResult.data.count}`);
  } catch (error) {
    console.error("Erro na validação de acesso à API Belvo:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha na autenticação com a API Belvo. Verifique suas credenciais.",
        details: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
    );
  }
  
  try {
    const widgetTokenResult = await callBelvoAPI('/api/token/', 'POST', belvoSecretId, belvoSecretPassword, sandbox, {
      id: belvoSecretId,
      password: belvoSecretPassword,
      scopes: 'read_institutions,write_links,read_links,read_accounts',
    });

    if (!widgetTokenResult.success || !widgetTokenResult.data.access) {
      throw new Error("Falha ao obter token de acesso do Belvo");
    }

    return new Response(
      JSON.stringify({ 
        widget_token: widgetTokenResult.data.access,
        institution
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro ao obter widget token:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao obter token para o widget", 
        details: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
