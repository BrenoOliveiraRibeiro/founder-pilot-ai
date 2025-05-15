
import { useState, useEffect } from 'react';
import { useFinanceMetrics } from './useFinanceMetrics';
import { useFinanceTransactions } from './useFinanceTransactions';
import { useFinanceInsights } from './useFinanceInsights';

// Hook principal que combina dados financeiros
export const useFinanceData = (empresaId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Usar os hooks específicos
  const { 
    metrics, 
    isRunwayCritical, 
    cashRunway, 
    loading: metricsLoading, 
    error: metricsError 
  } = useFinanceMetrics(empresaId);

  const { 
    transactions, 
    loading: transactionsLoading, 
    error: transactionsError 
  } = useFinanceTransactions(empresaId);

  const { 
    insights, 
    loading: insightsLoading, 
    error: insightsError 
  } = useFinanceInsights(empresaId);

  // Atualizar estados gerais com base nos hooks específicos
  useEffect(() => {
    setLoading(metricsLoading || transactionsLoading || insightsLoading);
    setError(metricsError || transactionsError || insightsError);
  }, [
    metricsLoading, transactionsLoading, insightsLoading,
    metricsError, transactionsError, insightsError
  ]);

  return {
    loading,
    error,
    metrics,
    transactions,
    insights,
    cashRunway,
    isRunwayCritical
  };
};
