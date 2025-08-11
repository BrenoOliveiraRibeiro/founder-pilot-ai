
import { getPluggyToken } from "./utils.ts";
import { processFinancialData } from "./financial-data.ts";

export async function syncData(
  empresaId: string, 
  integrationId: string | undefined, 
  sandbox: boolean, 
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  supabase: any, 
  corsHeaders: Record<string, string>
) {
  console.log(`[SYNC] Iniciando sincronização para empresa ${empresaId}, integração: ${integrationId || 'todas'}, sandbox: ${sandbox}`);
  
  try {
    // Get API key
    console.log('[SYNC] Obtendo token da API Pluggy...');
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      console.error('[SYNC] Falha na autenticação:', tokenResult.error);
      throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error.message}`);
    }
    
    console.log('[SYNC] Token obtido com sucesso');
    const apiKey = tokenResult.data.apiKey;
    
    // If integration_id is provided, sync only that integration
    if (integrationId) {
      const { data: integracao, error: integracaoError } = await supabase
        .from("integracoes_bancarias")
        .select("*")
        .eq("id", integrationId)
        .eq("empresa_id", empresaId)
        .eq("status", "ativo")
        .single();
        
      if (integracaoError) {
        throw new Error(`Integração não encontrada: ${integracaoError.message}`);
      }
      
      console.log(`[SYNC] Sincronizando integração específica: ${integracao.id}, ${integracao.nome_banco}, item_id: ${integracao.detalhes?.item_id || integracao.item_id}`);
      
      // Use processFinancialData para sincronização consistente
      console.log('[SYNC] Chamando processFinancialData...');
      const result = await processFinancialData(
        empresaId, 
        integracao.detalhes?.item_id || integracao.item_id, 
        null, // accountId será determinado automaticamente
        null, // transactionsData será buscado da API
        apiKey,
        pluggyClientId, 
        pluggyClientSecret, 
        integracao.detalhes?.sandbox || sandbox, 
        supabase
      );
      
      console.log(`[SYNC] Resultado do processFinancialData:`, result);
      
      // Update sync timestamp
      await supabase
        .from("integracoes_bancarias")
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq("id", integracao.id);
        
      console.log(`Resultado da sincronização: ${result.message}, novas: ${result.newTransactions}, duplicatas: ${result.duplicates}`);
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: result.message,
          newTransactions: result.newTransactions || 0,
          duplicates: result.duplicates || 0,
          total: result.total || 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      // Fetch all active integrations for the company
      const { data: integracoes, error: integracoesError } = await supabase
        .from("integracoes_bancarias")
        .select("*")
        .eq("empresa_id", empresaId)
        .eq("status", "ativo")
        .eq("tipo_conexao", "Open Finance");
        
      if (integracoesError) {
        throw integracoesError;
      }
      
      if (!integracoes || integracoes.length === 0) {
        return new Response(
          JSON.stringify({ error: "Nenhuma integração ativa encontrada" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
      }
      
      console.log(`[SYNC] Encontradas ${integracoes.length} integrações ativas para sincronização`);
      
      let totalNewTransactions = 0;
      let totalDuplicates = 0;
      let totalProcessed = 0;
      let failedIntegrations = 0;
      
      // For each integration, use processFinancialData consistently
      for (const integracao of integracoes) {
        try {
          console.log(`[SYNC] Processando integração: ${integracao.nome_banco} (${integracao.id}), item_id: ${integracao.detalhes?.item_id || integracao.item_id}`);
          
          const result = await processFinancialData(
            empresaId, 
            integracao.detalhes?.item_id || integracao.item_id, 
            null, // accountId será determinado automaticamente
            null, // transactionsData será buscado da API
            apiKey,
            pluggyClientId, 
            pluggyClientSecret, 
            integracao.detalhes?.sandbox || sandbox, 
            supabase
          );
          
          console.log(`[SYNC] Resultado da integração ${integracao.nome_banco}:`, result);
          
          totalNewTransactions += result.newTransactions || 0;
          totalDuplicates += result.duplicates || 0;
          totalProcessed += result.total || 0;
          
          console.log(`[SYNC] Integração ${integracao.nome_banco}: ${result.newTransactions} novas, ${result.duplicates} duplicatas`);
        } catch (error) {
          console.error(`[SYNC] Erro ao sincronizar integração ${integracao.id}:`, error);
          failedIntegrations++;
          
          // Tentar novamente após 2 segundos
          try {
            console.log(`[SYNC] Tentativa de retry para integração ${integracao.id}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const retryResult = await processFinancialData(
              empresaId, 
              integracao.detalhes?.item_id || integracao.item_id, 
              null,
              null,
              apiKey,
              pluggyClientId, 
              pluggyClientSecret, 
              integracao.detalhes?.sandbox || sandbox, 
              supabase
            );
            
            console.log(`[SYNC] Retry bem-sucedido para ${integracao.nome_banco}:`, retryResult);
            totalNewTransactions += retryResult.newTransactions || 0;
            totalDuplicates += retryResult.duplicates || 0;
            totalProcessed += retryResult.total || 0;
            failedIntegrations--; // Remove da contagem de falhas
          } catch (retryError) {
            console.error(`[SYNC] Retry falhou para integração ${integracao.id}:`, retryError);
          }
        }
      }
      
      console.log(`[SYNC] Resumo da sincronização: ${totalNewTransactions} novas, ${totalDuplicates} duplicatas, ${failedIntegrations} falhas`);
      
      // Update sync timestamp for all integrations
      await supabase
        .from("integracoes_bancarias")
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq("empresa_id", empresaId)
        .eq("tipo_conexao", "Open Finance");
      
      // Determinar mensagem baseada no resultado
      let message = "";
      if (totalNewTransactions > 0) {
        message = `${totalNewTransactions} novas transações sincronizadas`;
        if (totalDuplicates > 0) {
          message += ` (${totalDuplicates} duplicatas ignoradas)`;
        }
      } else if (totalDuplicates > 0) {
        message = "Nenhuma transação nova encontrada - todas já estão salvas";
      } else {
        message = "Nenhuma transação encontrada para sincronizar";
      }
      
      console.log(`Sincronização completa: ${message}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message,
          newTransactions: totalNewTransactions,
          duplicates: totalDuplicates,
          total: totalProcessed
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao sincronizar dados", 
        message: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
