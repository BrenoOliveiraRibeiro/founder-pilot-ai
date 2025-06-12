
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function authorizeConnection(
  empresaId: string,
  institution: string,
  sandbox: boolean,
  pluggyClientId: string,
  pluggyClientSecret: string,
  corsHeaders: Record<string, string>
) {
  console.log(`Iniciando autorização para empresa ${empresaId} com ${institution} (sandbox: ${sandbox})`);

  try {
    // Get Pluggy API token
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error("Erro na autenticação com a API Pluggy:", tokenResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Falha na autenticação com a API Pluggy", 
          details: tokenResult.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const apiKey = tokenResult.data.apiKey;
    console.log("Token Pluggy obtido com sucesso");

    // Create connect token for Pluggy widget
    const connectTokenResult = await callPluggyAPI('/connect_token', 'POST', apiKey, {
      itemId: null,
      clientUserId: `user_${Date.now()}`,
      options: {
        connectorId: institution === "pluggy-bank" ? 2 : null
      }
    });

    if (!connectTokenResult.success) {
      console.error("Erro ao criar connect token:", connectTokenResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Falha ao criar token de conexão", 
          details: connectTokenResult.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const connectToken = connectTokenResult.data.accessToken;
    console.log("Connect token criado com sucesso");

    return new Response(
      JSON.stringify({ 
        success: true, 
        connect_token: connectToken,
        message: "Token de autorização criado com sucesso"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error) {
    console.error("Erro na autorização:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar autorização", 
        message: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
