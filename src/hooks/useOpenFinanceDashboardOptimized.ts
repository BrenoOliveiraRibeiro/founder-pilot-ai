
import { useMemo } from "react";
import { useOpenFinanceConnections } from "./useOpenFinanceConnections";
import { useTransactionsMetrics } from "./useTransactionsMetrics";
import { useAuth } from "@/contexts/AuthContext";

export const useOpenFinanceDashboardOptimized = () => {
  const { currentEmpresa } = useAuth();
  const { activeIntegrations, loading: connectionsLoading } = useOpenFinanceConnections();
  const { metrics: transactionMetrics, loading: transactionsLoading } = useTransactionsMetrics(currentEmpresa?.id);

  const optimizedMetrics = useMemo(() => {
    if (!currentEmpresa?.id) return null;
    
    const hasOpenFinanceData = activeIntegrations.length > 0;
    
    if (hasOpenFinanceData && transactionMetrics) {
      return {
        saldoTotal: transactionMetrics.saldoAtual || 0,
        receitaMensal: transactionMetrics.entradasMesAtual || 0,
        despesasMensais: transactionMetrics.saidasMesAtual || 0,
        fluxoCaixa: (transactionMetrics.entradasMesAtual || 0) - (transactionMetrics.saidasMesAtual || 0),
        runwayMeses: transactionMetrics.runway || 0,
        burnRate: transactionMetrics.saidasMesAtual || 0,
        ultimaAtualizacao: new Date().toISOString(),
        integracoesAtivas: activeIntegrations.length,
        alertaCritico: (transactionMetrics.runway || 0) < 3
      };
    }
    
    return null;
  }, [activeIntegrations, transactionMetrics, currentEmpresa?.id]);

  return {
    metrics: optimizedMetrics,
    loading: connectionsLoading || transactionsLoading,
    hasOpenFinanceData: activeIntegrations.length > 0
  };
};
