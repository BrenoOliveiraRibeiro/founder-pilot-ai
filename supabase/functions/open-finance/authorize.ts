
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function authorizeConnection(empresaId: string, institution: string, sandbox: boolean, pluggyClientId: string, pluggyClientSecret: string, corsHeaders: Record<string, string>, updateItemId?: string) {
  console.log(`Iniciando autorização para empresa ${empresaId} com ${institution} (sandbox: ${sandbox}, updateMode: ${!!updateItemId})`);
  
  try {
    // Primeiro, obter token da API Pluggy
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error("Erro na autenticação com a API Pluggy:", tokenResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Falha na autenticação com a API Pluggy. Verifique suas credenciais.",
          details: tokenResult.error 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const apiKey = tokenResult.data.apiKey;
    console.log("Token da API Pluggy obtido com sucesso");
    
    // Preparar body para connect token
    const connectTokenBody: any = {
      clientUserId: `empresa_${empresaId}`,
      options: {
        includeSandbox: sandbox,
        products: ['accounts', 'transactions']
      }
    };

    // CRÍTICO: Se for modo de atualização, adicionar updateItemId no nível raiz
    if (updateItemId) {
      connectTokenBody.updateItemId = updateItemId;
      console.log(`Modo de atualização ativado para item: ${updateItemId}`);
      console.log("Body completo para connect token:", JSON.stringify(connectTokenBody, null, 2));
    }
    
    // Agora, gerar connect token para o widget
    // CRÍTICO: Para modo de atualização, adicionar itemId como parâmetro na URL
    let endpoint = '/connect_token';
    if (updateItemId) {
      endpoint = `/connect_token?itemId=${updateItemId}`;
      console.log(`Criando connect token para atualização com endpoint: ${endpoint}`);
    }
    
    const connectTokenResult = await callPluggyAPI(endpoint, 'POST', apiKey, connectTokenBody);
    
    if (!connectTokenResult.success) {
      console.error("Erro ao gerar connect token:", connectTokenResult.error);
      return new Response(
        JSON.stringify({ 
          error: "Falha ao gerar token de conexão", 
          details: connectTokenResult.error
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        connect_token: connectTokenResult.data.accessToken,
        api_key: apiKey,
        institution,
        sandbox: sandbox,
        empresa_id: empresaId,
        updateMode: !!updateItemId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro ao obter connect token:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao obter token para o widget", 
        details: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
