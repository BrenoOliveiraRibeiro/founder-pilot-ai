
import { getPluggyToken } from "./utils.ts";
import { processFinancialData, saveTransactionsToSupabase } from "./financial-data.ts";

export async function syncData(
  empresaId: string,
  integrationId: string | null,
  sandbox: boolean,
  pluggyClientId: string,
  pluggyClientSecret: string,
  supabase: any,
  corsHeaders: Record<string, string>
) {
  console.log(`Iniciando sincronização de dados para empresa ${empresaId}`);
  
  try {
    // Obter token da API Pluggy
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error?.message}`);
    }
    
    const apiKey = tokenResult.data!.apiKey;
    console.log('Token da API Pluggy obtido com sucesso');
    
    // Buscar integrações ativas da empresa
    const { data: integrations, error: integrationError } = await supabase
      .from("integracoes_bancarias")
      .select("*")
      .eq("empresa_id", empresaId)
      .eq("status", "ativo")
      .eq("tipo_conexao", "Open Finance");
    
    if (integrationError) {
      console.error("Erro ao buscar integrações:", integrationError);
      throw integrationError;
    }
    
    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: "Nenhuma integração ativa encontrada",
          transactionCount: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    console.log(`Encontradas ${integrations.length} integrações ativas`);
    
    let totalTransactionsSynced = 0;
    
    // Para cada integração, sincronizar dados
    for (const integration of integrations) {
      const itemId = integration.detalhes?.item_id;
      
      if (!itemId) {
        console.log(`Integração ${integration.id} não possui item_id válido`);
        continue;
      }
      
      console.log(`Processando integração ${integration.id} com item ${itemId}`);
      
      try {
        // Processar dados financeiros
        const financialData = await processFinancialData(itemId, apiKey, sandbox);
        
        // Salvar transações no Supabase
        const saveResult = await saveTransactionsToSupabase(
          financialData.transactions,
          empresaId,
          supabase
        );
        
        totalTransactionsSynced += saveResult.saved;
        
        // Atualizar timestamp da última sincronização
        const { error: updateError } = await supabase
          .from("integracoes_bancarias")
          .update({ 
            ultimo_sincronismo: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("id", integration.id);
          
        if (updateError) {
          console.error("Erro ao atualizar timestamp de sincronização:", updateError);
        }
        
        console.log(`Integração ${integration.id} sincronizada: ${saveResult.saved} transações`);
        
      } catch (error) {
        console.error(`Erro ao processar integração ${integration.id}:`, error);
        // Continuar com outras integrações mesmo se uma falhar
      }
    }
    
    console.log(`Sincronização concluída. Total de transações: ${totalTransactionsSynced}`);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Dados sincronizados com sucesso",
        integrationsProcessed: integrations.length,
        transactionCount: totalTransactionsSynced
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
    
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha na sincronização dos dados", 
        message: error.message 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
