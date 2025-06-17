
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
}

export interface CacheInfo {
  size: number;
  maxSize: number;
  stats: CacheStats;
  hitRate: number;
}

export interface SmartCacheOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
  backgroundRefresh?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

export interface SmartCacheReturn<T> {
  getCachedData: () => Promise<T>;
  invalidateCache: () => void;
  refreshCache: () => Promise<T>;
  getCacheInfo: () => CacheInfo;
}
