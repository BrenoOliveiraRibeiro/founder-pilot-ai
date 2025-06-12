
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function processCallback(
  empresaId: string, 
  itemId: string, 
  sandbox: boolean, 
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  supabase: any, 
  corsHeaders: Record<string, string>
) {
  console.log(`Processando callback para empresa ${empresaId}, item ${itemId}`);
  
  try {
    // Get API key
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error.message}`);
    }
    
    const apiKey = tokenResult.data.apiKey;
    
    // Validate that the item exists and is accessible
    const itemResult = await callPluggyAPI(`/items/${itemId}`, 'GET', apiKey);
    
    if (!itemResult.success) {
      throw new Error(`Item não encontrado ou inacessível: ${itemResult.error.message}`);
    }
    
    console.log('Item validado com sucesso:', itemResult.data);
    
    // Check if integration already exists
    const { data: existingIntegration, error: checkError } = await supabase
      .from("integracoes_bancarias")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("detalhes->>item_id", itemId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Erro ao verificar integração existente:", checkError);
    }
    
    if (existingIntegration) {
      console.log("Integração já existe, atualizando status");
      
      // Update existing integration
      const { error: updateError } = await supabase
        .from("integracoes_bancarias")
        .update({ 
          status: "ativo",
          ultimo_sincronismo: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", existingIntegration.id);
        
      if (updateError) {
        console.error("Erro ao atualizar integração existente:", updateError);
        throw updateError;
      }
    } else {
      console.log("Criando nova integração");
      
      // Create new integration
      const { error: insertError } = await supabase
        .from("integracoes_bancarias")
        .insert([{
          empresa_id: empresaId,
          nome_banco: itemResult.data.connector?.name || 'Banco conectado via Pluggy',
          tipo_conexao: 'Open Finance',
          status: 'ativo',
          detalhes: {
            item_id: itemId,
            connector_id: itemResult.data.connector?.id,
            sandbox: sandbox,
            provider: 'pluggy'
          },
          ultimo_sincronismo: new Date().toISOString()
        }]);
        
      if (insertError) {
        console.error("Erro ao criar nova integração:", insertError);
        throw insertError;
      }
    }
    
    console.log("Callback processado com sucesso");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Integração registrada com sucesso",
        item_id: itemId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro no callback:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar callback", 
        message: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
