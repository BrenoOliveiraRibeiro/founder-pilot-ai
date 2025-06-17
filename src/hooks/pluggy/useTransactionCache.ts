
import { useState, useCallback } from 'react';

export const useTransactionCache = () => {
  const [lastSyncTimestamps, setLastSyncTimestamps] = useState<Record<string, number>>({});

  const checkCacheValidity = useCallback((itemId: string, accountId: string): boolean => {
    const cacheKey = `${itemId}_${accountId}`;
    const lastSync = lastSyncTimestamps[cacheKey];
    const now = Date.now();
    const minIntervalMs = 30000; // 30 segundos

    return lastSync && (now - lastSync) < minIntervalMs;
  }, [lastSyncTimestamps]);

  const updateCache = useCallback((itemId: string, accountId: string) => {
    const cacheKey = `${itemId}_${accountId}`;
    const now = Date.now();
    setLastSyncTimestamps(prev => ({ ...prev, [cacheKey]: now }));
  }, []);

  return {
    lastSyncTimestamps,
    setLastSyncTimestamps,
    checkCacheValidity,
    updateCache
  };
};
