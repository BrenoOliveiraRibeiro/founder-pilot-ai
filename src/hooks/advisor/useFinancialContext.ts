
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { supabase } from "@/integrations/supabase/client";
import { FinancialContext, AdvisorChatUserData } from "./types";

export const useFinancialContext = (userData: AdvisorChatUserData) => {
  const { metrics, loading: metricsLoading } = useOpenFinanceDashboard();

  const getRecentTransactions = async () => {
    if (!userData.empresaId) return [];
    
    try {
      // Buscar TODAS as transações para análise completa da IA
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', userData.empresaId)
        .order('data_transacao', { ascending: false });
      
      if (error) throw error;
      return transacoes || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  };

  const prepareFinancialContext = async (): Promise<FinancialContext> => {
    const allTransactions = await getRecentTransactions();
    
    const despesas = allTransactions.filter(t => t.tipo === 'despesa');
    const receitas = allTransactions.filter(t => t.tipo === 'receita');
    
    const despesasPorCategoria = despesas.reduce((acc, tx) => {
      acc[tx.categoria] = (acc[tx.categoria] || 0) + Math.abs(tx.valor);
      return acc;
    }, {} as Record<string, number>);

    const receitasPorMes = receitas.reduce((acc, tx) => {
      const mes = new Date(tx.data_transacao).toISOString().slice(0, 7);
      acc[mes] = (acc[mes] || 0) + tx.valor;
      return acc;
    }, {} as Record<string, number>);

    // Análise de tendências baseada no histórico completo
    const despesasPorMes = despesas.reduce((acc, tx) => {
      const mes = new Date(tx.data_transacao).toISOString().slice(0, 7);
      acc[mes] = (acc[mes] || 0) + Math.abs(tx.valor);
      return acc;
    }, {} as Record<string, number>);

    // Calcular médias móveis para detectar tendências
    const mesesOrdenados = Object.keys(receitasPorMes).sort();
    const ultimos3MesesReceita = mesesOrdenados.slice(-3).reduce((sum, mes) => sum + (receitasPorMes[mes] || 0), 0) / 3;
    const ultimos6MesesReceita = mesesOrdenados.slice(-6).reduce((sum, mes) => sum + (receitasPorMes[mes] || 0), 0) / 6;

    const mesesDespesasOrdenados = Object.keys(despesasPorMes).sort();
    const ultimos3MesesDespesas = mesesDespesasOrdenados.slice(-3).reduce((sum, mes) => sum + (despesasPorMes[mes] || 0), 0) / 3;

    // Identificar transações recorrentes
    const transacoesRecorrentes = allTransactions.filter(t => t.recorrente);
    const receitaRecorrente = transacoesRecorrentes.filter(t => t.tipo === 'receita').reduce((sum, tx) => sum + tx.valor, 0);
    const despesaRecorrente = transacoesRecorrentes.filter(t => t.tipo === 'despesa').reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

    return {
      metrics: metrics || null,
      transacoes: {
        total: allTransactions.length,
        // Manter as 10 mais recentes para apresentação rápida
        recentes: allTransactions.slice(0, 10),
        // Histórico completo SEM LIMITE para análise da IA
        historicoCompleto: allTransactions,
        despesasPorCategoria,
        receitasPorMes,
        despesasPorMes,
        totalReceitas: receitas.reduce((sum, tx) => sum + tx.valor, 0),
        totalDespesas: despesas.reduce((sum, tx) => sum + Math.abs(tx.valor), 0),
        // Métricas avançadas baseadas no histórico completo
        tendencias: {
          receitaMedia3Meses: ultimos3MesesReceita,
          receitaMedia6Meses: ultimos6MesesReceita,
          despesaMedia3Meses: ultimos3MesesDespesas,
          crescimentoReceitaTendencia: ultimos3MesesReceita > ultimos6MesesReceita ? 'crescimento' : 'declinio',
        },
        recorrencia: {
          receitaRecorrente,
          despesaRecorrente,
          percentualReceitaRecorrente: receitas.length > 0 ? (receitaRecorrente / receitas.reduce((sum, tx) => sum + tx.valor, 0)) * 100 : 0,
          percentualDespesaRecorrente: despesas.length > 0 ? (despesaRecorrente / despesas.reduce((sum, tx) => sum + Math.abs(tx.valor), 0)) * 100 : 0,
        }
      },
      alertas: {
        runwayCritico: metrics && metrics.runwayMeses < 3,
        burnRateAlto: metrics && metrics.burnRate > (metrics.receitaMensal * 1.2),
        crescimentoReceita: ultimos3MesesReceita > ultimos6MesesReceita
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
