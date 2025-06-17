
import { useState, useCallback } from 'react';
import { useCacheManager } from '../cache/useCacheManager';

interface TransactionCacheEntry {
  data: any;
  lastSync: number;
  accountId: string;
  itemId: string;
}

export const useTransactionCache = () => {
  const cache = useCacheManager<TransactionCacheEntry>({
    defaultTTL: 30000, // 30 seconds for transaction sync validation
    maxSize: 20
  });

  const [lastSyncTimestamps, setLastSyncTimestamps] = useState<Record<string, number>>({});

  const checkCacheValidity = useCallback((itemId: string, accountId: string): boolean => {
    const cacheKey = `${itemId}_${accountId}`;
    const cachedEntry = cache.get(cacheKey);
    
    if (cachedEntry) {
      const now = Date.now();
      const timeSinceLastSync = now - cachedEntry.lastSync;
      const minIntervalMs = 30000; // 30 segundos
      
      return timeSinceLastSync < minIntervalMs;
    }
    
    // Fallback para o sistema antigo
    const lastSync = lastSyncTimestamps[cacheKey];
    const now = Date.now();
    const minIntervalMs = 30000;

    return lastSync && (now - lastSync) < minIntervalMs;
  }, [cache, lastSyncTimestamps]);

  const updateCache = useCallback((itemId: string, accountId: string, data?: any) => {
    const cacheKey = `${itemId}_${accountId}`;
    const now = Date.now();
    
    // Atualizar cache inteligente
    cache.set(cacheKey, {
      data: data || null,
      lastSync: now,
      accountId,
      itemId
    });
    
    // Manter compatibilidade com sistema antigo
    setLastSyncTimestamps(prev => ({ ...prev, [cacheKey]: now }));
  }, [cache]);

  const getCachedTransactions = useCallback((itemId: string, accountId: string) => {
    const cacheKey = `${itemId}_${accountId}`;
    const cachedEntry = cache.get(cacheKey);
    return cachedEntry?.data || null;
  }, [cache]);

  const invalidateTransactionCache = useCallback((itemId?: string, accountId?: string) => {
    if (itemId && accountId) {
      const cacheKey = `${itemId}_${accountId}`;
      cache.invalidate(cacheKey);
      setLastSyncTimestamps(prev => {
        const newState = { ...prev };
        delete newState[cacheKey];
        return newState;
      });
    } else {
      // Invalidar tudo
      cache.invalidate();
      setLastSyncTimestamps({});
    }
  }, [cache]);

  const getCacheStats = useCallback(() => {
    return cache.getCacheInfo();
  }, [cache]);

  return {
    lastSyncTimestamps,
    setLastSyncTimestamps,
    checkCacheValidity,
    updateCache,
    getCachedTransactions,
    invalidateTransactionCache,
    getCacheStats
  };
};
