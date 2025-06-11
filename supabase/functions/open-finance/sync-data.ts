
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
      await processFinancialData(
        empresaId, 
        integracao.detalhes.item_id, 
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
      
      // For each integration, fetch updated data
      for (const integracao of integracoes) {
        try {
          console.log(`Processando integração: ${integracao.id}, item_id: ${integracao.detalhes?.item_id}`);
          await processFinancialData(
            empresaId, 
            integracao.detalhes.item_id, 
            apiKey,
            pluggyClientId, 
            pluggyClientSecret, 
            integracao.detalhes.sandbox || false, 
            supabase
          );
          console.log(`Integração ${integracao.id} processada com sucesso`);
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
    }
    
    // Fetch updated metrics to return to client
    const { data: metricasData } = await supabase
      .from("metricas")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("data_referencia", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // Fetch transaction count to verify
    const { count: transactionCount } = await supabase
      .from("transacoes")
      .select("*", { count: 'exact', head: true })
      .eq("empresa_id", empresaId);
    
    console.log(`Sincronização concluída. Transações salvas: ${transactionCount}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Dados sincronizados com sucesso", 
        data: metricasData,
        transactionCount: transactionCount
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
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
