
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function authorizeConnection(empresaId: string, institution: string, sandbox: boolean, pluggyClientId: string, pluggyClientSecret: string, corsHeaders: Record<string, string>, updateItemId?: string) {
  const isUpdateMode = !!updateItemId;
  console.log(`Iniciando autorização para empresa ${empresaId} com ${institution} (sandbox: ${sandbox}, modo: ${isUpdateMode ? 'UPDATE' : 'CREATE'})`);
  
  if (isUpdateMode) {
    console.log(`Item ID para atualização: ${updateItemId}`);
  }
  
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
    
    // Gerar connect token para o widget (modo CREATE ou UPDATE)
    const connectTokenPayload: any = {
      clientUserId: `empresa_${empresaId}`,
      options: {
        includeSandbox: sandbox,
        products: ['accounts', 'transactions'],
      }
    };

    // Se for modo UPDATE, adicionar itemId no payload
    if (isUpdateMode && updateItemId) {
      connectTokenPayload.itemId = updateItemId;
      console.log(`Connect token será criado para UPDATE do item: ${updateItemId}`);
    } else {
      console.log('Connect token será criado para CRIAÇÃO de novo item');
    }

    const connectTokenResult = await callPluggyAPI('/connect_token', 'POST', apiKey, connectTokenPayload);
    
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
        mode: isUpdateMode ? 'update' : 'create',
        update_item_id: updateItemId || null
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
