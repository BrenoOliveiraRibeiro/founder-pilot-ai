
import { getPluggyToken, callPluggyAPI } from "./utils.ts";
import { processFinancialData } from "./financial-data.ts";

export async function updatePluggyItem(
  empresaId: string, 
  itemId: string,
  integrationId: string,
  sandbox: boolean, 
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  supabase: any, 
  corsHeaders: Record<string, string>
) {
  console.log(`Atualizando item Pluggy ${itemId} da empresa ${empresaId}`);
  
  try {
    // Get API key
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error.message}`);
    }
    
    const apiKey = tokenResult.data.apiKey;
    
    // Fazer PATCH no item da Pluggy para atualizar
    console.log(`Fazendo PATCH no item ${itemId}...`);
    
    const updateResult = await callPluggyAPI(
      `/items/${itemId}`,
      'PATCH',
      apiKey,
      {} // Empty body - just trigger update
    );
    
    if (!updateResult.success) {
      console.error(`Erro ao fazer PATCH no item ${itemId}:`, updateResult.error);
      throw new Error(`Falha ao atualizar item: ${updateResult.error.message}`);
    }
    
    console.log(`Item ${itemId} atualizado com sucesso:`, updateResult.data);
    
    // Buscar a integração no Supabase para obter detalhes
    const { data: integracao, error: integracaoError } = await supabase
      .from("integracoes_bancarias")
      .select("*")
      .eq("id", integrationId)
      .eq("empresa_id", empresaId)
      .single();
      
    if (integracaoError) {
      throw new Error(`Integração não encontrada: ${integracaoError.message}`);
    }
    
    console.log(`Processando dados financeiros para item atualizado ${itemId}...`);
    
    // Usar processFinancialData para buscar e salvar novas transações
    const result = await processFinancialData(
      empresaId, 
      itemId, 
      null, // accountId será determinado automaticamente
      null, // transactionsData será buscado da API
      apiKey,
      pluggyClientId, 
      pluggyClientSecret, 
      sandbox, 
      supabase
    );
    
    // Atualizar timestamp de sincronização
    await supabase
      .from("integracoes_bancarias")
      .update({ ultimo_sincronismo: new Date().toISOString() })
      .eq("id", integrationId);
      
    console.log(`Update do item ${itemId} concluído: ${result.message}, novas: ${result.newTransactions}, duplicatas: ${result.duplicates}`);
        
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: result.message,
        newTransactions: result.newTransactions || 0,
        duplicates: result.duplicates || 0,
        total: result.total || 0,
        itemId: itemId,
        itemUpdateResult: updateResult.data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Erro no update do item Pluggy:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao atualizar item Pluggy", 
        message: error.message,
        itemId: itemId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
