
import { useCallback, useEffect } from 'react';
import { useCacheManager } from './useCacheManager';
import type { SmartCacheOptions, SmartCacheReturn } from '../types/cacheTypes';

export const useSmartCache = <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: SmartCacheOptions = {}
): SmartCacheReturn<T> => {
  const {
    ttl = 300000, // 5 minutes default
    staleWhileRevalidate = true,
    backgroundRefresh = true,
    retryOnError = true,
    maxRetries = 3
  } = options;

  const cache = useCacheManager<T>({ defaultTTL: ttl, maxSize: 50 });

  const fetchWithRetry = useCallback(async (retryCount = 0): Promise<T> => {
    try {
      const result = await fetchFn();
      cache.set(cacheKey, result, ttl);
      return result;
    } catch (error) {
      if (retryOnError && retryCount < maxRetries) {
        console.warn(`Cache fetch retry ${retryCount + 1}/${maxRetries} for key: ${cacheKey}`);
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount))); // Exponential backoff
        return fetchWithRetry(retryCount + 1);
      }
      throw error;
    }
  }, [fetchFn, cacheKey, cache, ttl, retryOnError, maxRetries]);

  const getCachedData = useCallback(async (): Promise<T> => {
    const cached = cache.get(cacheKey);
    
    if (cached) {
      // If we have cached data and stale-while-revalidate is enabled,
      // return cached data immediately and refresh in background
      if (staleWhileRevalidate && backgroundRefresh) {
        // Background refresh
        fetchWithRetry().catch(error => {
          console.warn('Background refresh failed:', error);
        });
      }
      return cached;
    }

    // No cached data, fetch fresh
    return fetchWithRetry();
  }, [cache, cacheKey, staleWhileRevalidate, backgroundRefresh, fetchWithRetry]);

  const invalidateCache = useCallback((): void => {
    cache.invalidate(cacheKey);
  }, [cache, cacheKey]);

  const refreshCache = useCallback(async (): Promise<T> => {
    cache.invalidate(cacheKey);
    return fetchWithRetry();
  }, [cache, cacheKey, fetchWithRetry]);

  // Clean up expired entries periodically
  useEffect(() => {
    const interval = setInterval(() => {
      cache.cleanExpired();
    }, 60000); // Clean every minute

    return () => clearInterval(interval);
  }, [cache]);

  return {
    getCachedData,
    invalidateCache,
    refreshCache,
    getCacheInfo: cache.getCacheInfo
  };
};
