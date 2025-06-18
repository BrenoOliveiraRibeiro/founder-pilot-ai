
import { useMemo } from "react";
import { useOpenFinanceConnections } from "./useOpenFinanceConnections";
import { useTransactionsMetrics } from "./useTransactionsMetrics";
import { useAuth } from "@/contexts/AuthContext";

export const useOpenFinanceDashboardOptimized = () => {
  const { currentEmpresa } = useAuth();
  const { activeIntegrations, loading: connectionsLoading } = useOpenFinanceConnections();
  const { 
    saldoCaixa, 
    entradasMesAtual, 
    saidasMesAtual, 
    loading: transactionsLoading,
    error 
  } = useTransactionsMetrics();

  const optimizedMetrics = useMemo(() => {
    if (!currentEmpresa?.id) return null;
    
    const hasOpenFinanceData = activeIntegrations.length > 0;
    
    // Calcular runway baseado nos dados disponíveis
    const burnRate = saidasMesAtual || 0;
    const runway = burnRate > 0 ? (saldoCaixa || 0) / burnRate : 0;
    
    if (hasOpenFinanceData || saldoCaixa > 0 || entradasMesAtual > 0 || saidasMesAtual > 0) {
      return {
        saldoTotal: saldoCaixa || 0,
        receitaMensal: entradasMesAtual || 0,
        despesasMensais: saidasMesAtual || 0,
        fluxoCaixa: (entradasMesAtual || 0) - (saidasMesAtual || 0),
        runwayMeses: runway,
        burnRate: burnRate,
        ultimaAtualizacao: new Date().toISOString(),
        integracoesAtivas: activeIntegrations.length,
        alertaCritico: runway > 0 && runway < 3
      };
    }
    
    return null;
  }, [activeIntegrations, saldoCaixa, entradasMesAtual, saidasMesAtual, currentEmpresa?.id]);

  const refetch = async () => {
    // Implementar lógica de refetch se necessário
    window.location.reload();
  };

  return {
    metrics: optimizedMetrics,
    loading: connectionsLoading || transactionsLoading,
    hasOpenFinanceData: activeIntegrations.length > 0,
    error,
    refetch
  };
};
