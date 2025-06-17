
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartCache } from './useSmartCache';
import { pluggyApi } from '@/utils/pluggyApi';

export const useFinancialDataCache = () => {
  const { currentEmpresa } = useAuth();

  const createAccountDataCache = useCallback((itemId: string) => {
    const cacheKey = `account_data_${currentEmpresa?.id}_${itemId}`;
    
    return useSmartCache(
      cacheKey,
      () => pluggyApi.fetchAccountData(itemId),
      {
        ttl: 300000, // 5 minutes for account data
        staleWhileRevalidate: true,
        backgroundRefresh: true
      }
    );
  }, [currentEmpresa?.id]);

  const createTransactionsCache = useCallback((accountId: string) => {
    const cacheKey = `transactions_${currentEmpresa?.id}_${accountId}`;
    
    return useSmartCache(
      cacheKey,
      () => pluggyApi.fetchTransactions(accountId),
      {
        ttl: 180000, // 3 minutes for transactions (more frequent updates)
        staleWhileRevalidate: true,
        backgroundRefresh: true,
        retryOnError: true,
        maxRetries: 2
      }
    );
  }, [currentEmpresa?.id]);

  const createMetricsCache = useCallback(() => {
    const cacheKey = `metrics_${currentEmpresa?.id}`;
    
    return useSmartCache(
      cacheKey,
      async () => {
        // Implementar fetch de métricas quando disponível
        return {};
      },
      {
        ttl: 600000, // 10 minutes for metrics
        staleWhileRevalidate: true,
        backgroundRefresh: false // Manual refresh for metrics
      }
    );
  }, [currentEmpresa?.id]);

  return {
    createAccountDataCache,
    createTransactionsCache,
    createMetricsCache
  };
};
