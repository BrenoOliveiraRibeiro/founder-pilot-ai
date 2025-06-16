
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { supabase } from "@/integrations/supabase/client";
import { FinancialContext, AdvisorChatUserData } from "./types";

export const useFinancialContext = (userData: AdvisorChatUserData) => {
  const { metrics, loading: metricsLoading } = useOpenFinanceDashboard();

  const getRecentTransactions = async () => {
    if (!userData.empresaId) return [];
    
    try {
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', userData.empresaId)
        .order('data_transacao', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return transacoes || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  };

  const prepareFinancialContext = async (): Promise<FinancialContext> => {
    const recentTransactions = await getRecentTransactions();
    
    const despesas = recentTransactions.filter(t => t.tipo === 'despesa');
    const receitas = recentTransactions.filter(t => t.tipo === 'receita');
    
    const despesasPorCategoria = despesas.reduce((acc, tx) => {
      acc[tx.categoria] = (acc[tx.categoria] || 0) + Math.abs(tx.valor);
      return acc;
    }, {} as Record<string, number>);

    const receitasPorMes = receitas.reduce((acc, tx) => {
      const mes = new Date(tx.data_transacao).toISOString().slice(0, 7);
      acc[mes] = (acc[mes] || 0) + tx.valor;
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics: metrics || null,
      transacoes: {
        total: recentTransactions.length,
        recentes: recentTransactions.slice(0, 5),
        despesasPorCategoria,
        receitasPorMes,
        totalReceitas: receitas.reduce((sum, tx) => sum + tx.valor, 0),
        totalDespesas: Math.abs(despesas.reduce((sum, tx) => sum + tx.valor, 0))
      },
      alertas: {
        runwayCritico: metrics && metrics.runwayMeses < 3,
        burnRateAlto: metrics && metrics.burnRate > (metrics.receitaMensal * 1.2),
        crescimentoReceita: false
      }
    };
  };

  return {
    metrics,
    metricsLoading,
    prepareFinancialContext,
    hasFinancialData: metrics && metrics.integracoesAtivas > 0
  };
};
