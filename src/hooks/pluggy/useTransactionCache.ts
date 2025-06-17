
import { useState, useCallback } from 'react';
import { useCacheManager } from '../cache/useCacheManager';
import type { TransactionCacheEntry, TransactionCacheStats, PluggyTransaction } from '../types/pluggyTypes';

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

    return lastSync ? (now - lastSync) < minIntervalMs : false;
  }, [cache, lastSyncTimestamps]);

  const updateCache = useCallback((itemId: string, accountId: string, data?: PluggyTransaction[] | null): void => {
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

  const getCachedTransactions = useCallback((itemId: string, accountId: string): PluggyTransaction[] | null => {
    const cacheKey = `${itemId}_${accountId}`;
    const cachedEntry = cache.get(cacheKey);
    return cachedEntry?.data || null;
  }, [cache]);

  const invalidateTransactionCache = useCallback((itemId?: string, accountId?: string): void => {
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

  const getCacheStats = useCallback((): TransactionCacheStats => {
    const cacheInfo = cache.getCacheInfo();
    const validEntries = Object.values(lastSyncTimestamps).filter(
      timestamp => Date.now() - timestamp < 30000
    ).length;
    
    return {
      totalEntries: cacheInfo.size,
      validEntries,
      expiredEntries: cacheInfo.size - validEntries,
      hitRate: cacheInfo.hitRate
    };
  }, [cache, lastSyncTimestamps]);

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
