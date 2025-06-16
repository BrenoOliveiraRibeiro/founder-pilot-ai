
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
      
      // Para integração específica, buscar transações e salvar automaticamente
      const result = await processFinancialData(
        empresaId, 
        integracao.detalhes.item_id, 
        null, // accountId será determinado automaticamente
        null, // transactionsData será buscado da API
        apiKey,
        pluggyClientId, 
        pluggyClientSecret, 
        integracao.detalhes.sandbox || false, 
        supabase
      );
      
      // Update sync timestamp
      await supabase
        .from("integracoes_bancarias")
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq("id", integracao.id);
        
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
      
      // For each integration, fetch updated data and save automatically
      for (const integracao of integracoes) {
        try {
          const result = await processFinancialData(
            empresaId, 
            integracao.detalhes.item_id, 
            null, // accountId será determinado automaticamente
            null, // transactionsData será buscado da API
            apiKey,
            pluggyClientId, 
            pluggyClientSecret, 
            integracao.detalhes.sandbox || false, 
            supabase
          );
          
          totalNewTransactions += result.newTransactions || 0;
          totalDuplicates += result.duplicates || 0;
          totalProcessed += result.total || 0;
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
      
      // Fetch updated metrics to return to client
      const { data: metricasData } = await supabase
        .from("metricas")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_referencia", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      let message = "";
      if (totalNewTransactions > 0) {
        message = `${totalNewTransactions} novas transações sincronizadas`;
        if (totalDuplicates > 0) {
          message += ` (${totalDuplicates} duplicatas ignoradas)`;
        }
      } else {
        message = "Nenhuma transação nova encontrada";
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message,
          newTransactions: totalNewTransactions,
          duplicates: totalDuplicates,
          total: totalProcessed,
          data: metricasData 
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
