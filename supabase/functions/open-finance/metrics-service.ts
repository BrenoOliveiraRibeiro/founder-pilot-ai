
import { callPluggyAPI, gerarInsights } from "./utils.ts";

export async function updateMetrics(
  empresaId: string, 
  insertedCount: number, 
  accountData: any, 
  itemId: string, 
  targetAccountId: string, 
  apiKey: string, 
  supabaseClient: any
) {
  if (insertedCount > 0 || !accountData) {
    console.log('Atualizando métricas devido a mudanças...');
    
    // Buscar dados da conta para calcular métricas se não tivermos
    if (!accountData && targetAccountId) {
      const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
      if (accountsResult.success && accountsResult.data.results) {
        accountData = accountsResult.data.results.find((acc: any) => acc.id === targetAccountId);
      }
    }
    
    // Buscar todas as transações da empresa para calcular métricas
    const { data: todasTransacoes, error: txError } = await supabaseClient
      .from("transacoes")
      .select("*")
      .eq("empresa_id", empresaId)
      .gte("data_transacao", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    
    if (!txError && todasTransacoes) {
      const receitas = todasTransacoes.filter(tx => tx.valor > 0);
      const despesas = todasTransacoes.filter(tx => tx.valor < 0);
      
      const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(tx.valor), 0) / 3;
      const burnRate = Math.abs(despesas.reduce((total, tx) => total + tx.valor, 0)) / 3;
      const caixaAtual = accountData ? accountData.balance : 0;
      const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
      const cashFlow = receitaMensal - burnRate;
      
      // Usar upsert para métricas - mais eficiente
      const { error: metricasError } = await supabaseClient
        .from("metricas")
        .upsert({
          empresa_id: empresaId,
          data_referencia: new Date().toISOString().split('T')[0],
          caixa_atual: caixaAtual,
          receita_mensal: receitaMensal,
          burn_rate: burnRate,
          runway_meses: runwayMeses,
          cash_flow: cashFlow,
          mrr_growth: 0
        }, {
          onConflict: 'empresa_id,data_referencia'
        });
        
      if (metricasError) {
        console.error("Erro ao salvar métricas:", metricasError);
      } else {
        console.log("Métricas atualizadas com upsert:", { receitaMensal, burnRate, runwayMeses });
      }
      
      // Gerar insights apenas se houve mudanças significativas
      await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
    }
  } else {
    console.log('Nenhuma transação nova - métricas não atualizadas');
  }
}
