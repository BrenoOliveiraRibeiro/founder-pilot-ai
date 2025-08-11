
import { getPluggyToken, callPluggyAPI } from "./utils.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

export async function authorizeConnection(empresaId: string, institution: string, sandbox: boolean, pluggyClientId: string, pluggyClientSecret: string, corsHeaders: Record<string, string>, updateItemId?: string) {
  const isUpdateMode = !!updateItemId;
  console.log(`Iniciando autorização para empresa ${empresaId} com ${institution} (sandbox: ${sandbox}, modo: ${isUpdateMode ? 'UPDATE' : 'CREATE'})`);
  
  if (isUpdateMode) {
    console.log(`Item ID para atualização: ${updateItemId}`);
  }
  
  try {
    // Se for modo UPDATE, validar se o item pertence à empresa
    if (isUpdateMode && updateItemId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      console.log(`Validando se item ${updateItemId} pertence à empresa ${empresaId}`);
      
      const { data: integration, error: integrationError } = await supabase
        .from('integracoes_bancarias')
        .select('id, item_id, empresa_id')
        .eq('item_id', updateItemId)
        .eq('empresa_id', empresaId)
        .single();
      
      if (integrationError || !integration) {
        console.error(`Item ${updateItemId} não encontrado ou não pertence à empresa ${empresaId}:`, integrationError);
        return new Response(
          JSON.stringify({ 
            error: "Item não encontrado ou acesso negado",
            details: "O item especificado não existe ou não pertence a esta empresa" 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
        );
      }
      
      console.log(`Item ${updateItemId} validado com sucesso para empresa ${empresaId}`);
    }
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
    
    // Para modo UPDATE, usar o itemId como parâmetro de URL (formato correto da API Pluggy)
    let endpoint = '/connect_token';
    let payload: any = {
      clientUserId: `empresa_${empresaId}`,
      options: {
        includeSandbox: sandbox,
        products: ['accounts', 'transactions'],
      }
    };

    if (isUpdateMode && updateItemId) {
      // CORREÇÃO: Para update, usar itemId como parâmetro de URL, não no body
      endpoint = `/connect_token?itemId=${updateItemId}`;
      console.log(`Connect token será criado para UPDATE do item: ${updateItemId} (endpoint: ${endpoint})`);
    } else {
      console.log('Connect token será criado para CRIAÇÃO de novo item');
    }

    const connectTokenResult = await callPluggyAPI(endpoint, 'POST', apiKey, payload);
    
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
