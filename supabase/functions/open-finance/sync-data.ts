
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
  console.log(`Sincronizando dados da empresa ${empresaId}`);
  
  try {
    // Get API key
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error.message}`);
    }
    
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
      
      console.log(`Sincronizando integração específica: ${integracao.id}, ${integracao.nome_banco}`);
      
      // Use processFinancialData para sincronização consistente
      const result = await processFinancialData(
        empresaId, 
        integracao.detalhes.item_id || integracao.item_id, 
        null, // accountId será determinado automaticamente
        null, // transactionsData será buscado da API
        apiKey,
        pluggyClientId, 
        pluggyClientSecret, 
        integracao.detalhes.sandbox || sandbox, 
        supabase
      );
      
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
      
      console.log(`Encontradas ${integracoes.length} integrações ativas`);
      
      let totalNewTransactions = 0;
      let totalDuplicates = 0;
      let totalProcessed = 0;
      
      // For each integration, use processFinancialData consistently
      for (const integracao of integracoes) {
        try {
          console.log(`Processando integração: ${integracao.nome_banco} (${integracao.id})`);
          
          const result = await processFinancialData(
            empresaId, 
            integracao.detalhes.item_id || integracao.item_id, 
            null, // accountId será determinado automaticamente
            null, // transactionsData será buscado da API
            apiKey,
            pluggyClientId, 
            pluggyClientSecret, 
            integracao.detalhes.sandbox || sandbox, 
            supabase
          );
          
          totalNewTransactions += result.newTransactions || 0;
          totalDuplicates += result.duplicates || 0;
          totalProcessed += result.total || 0;
          
          console.log(`Integração ${integracao.nome_banco}: ${result.newTransactions} novas, ${result.duplicates} duplicatas`);
        } catch (error) {
          console.error(`Erro ao sincronizar integração ${integracao.id}:`, error);
        }
      }
      
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
