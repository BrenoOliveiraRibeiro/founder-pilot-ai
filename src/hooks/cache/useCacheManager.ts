
import { useState, useCallback, useRef } from 'react';
import type { CacheEntry, CacheConfig, CacheStats, CacheInfo } from '../types/cacheTypes';

export const useCacheManager = <T>(config: CacheConfig = { defaultTTL: 300000, maxSize: 100 }) => {
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const [cacheStats, setCacheStats] = useState<CacheStats>({ hits: 0, misses: 0 });

  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    if (isExpired(entry)) {
      cacheRef.current.delete(key);
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    return entry.data;
  }, [isExpired]);

  const set = useCallback((key: string, data: T, customTTL?: number): void => {
    const ttl = customTTL || config.defaultTTL;
    
    // Remove oldest entries if cache is full
    if (cacheRef.current.size >= config.maxSize) {
      const oldestKey = cacheRef.current.keys().next().value;
      if (oldestKey) {
        cacheRef.current.delete(oldestKey);
      }
    }

    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, [config.defaultTTL, config.maxSize]);

  const invalidate = useCallback((keyPattern?: string): void => {
    if (!keyPattern) {
      cacheRef.current.clear();
      return;
    }

    const regex = new RegExp(keyPattern);
    for (const key of cacheRef.current.keys()) {
      if (regex.test(key)) {
        cacheRef.current.delete(key);
      }
    }
  }, []);

  const cleanExpired = useCallback((): void => {
    for (const [key, entry] of cacheRef.current.entries()) {
      if (isExpired(entry)) {
        cacheRef.current.delete(key);
      }
    }
  }, [isExpired]);

  const getCacheInfo = useCallback((): CacheInfo => {
    const totalRequests = cacheStats.hits + cacheStats.misses;
    return {
      size: cacheRef.current.size,
      maxSize: config.maxSize,
      stats: cacheStats,
      hitRate: totalRequests > 0 ? cacheStats.hits / totalRequests : 0
    };
  }, [config.maxSize, cacheStats]);

  return {
    get,
    set,
    invalidate,
    cleanExpired,
    getCacheInfo
  };
};
