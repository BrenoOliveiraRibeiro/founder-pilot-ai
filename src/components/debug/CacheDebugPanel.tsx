
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Trash2, Activity } from 'lucide-react';
import { usePluggyDataSync } from '@/hooks/usePluggyDataSync';
import { useTransactionCache } from '@/hooks/pluggy/useTransactionCache';

interface CacheDebugPanelProps {
  itemId?: string;
  accountId?: string;
}

export const CacheDebugPanel: React.FC<CacheDebugPanelProps> = ({ itemId, accountId }) => {
  const { invalidateCache, refreshCache } = usePluggyDataSync();
  const { getCacheStats, invalidateTransactionCache } = useTransactionCache();
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      try {
        const stats = getCacheStats();
        setCacheStats(stats);
      } catch (error) {
        console.error('Erro ao obter estatísticas do cache:', error);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, [getCacheStats]);

  const handleInvalidateCache = async () => {
    try {
      invalidateCache(itemId, accountId);
      invalidateTransactionCache(itemId, accountId);
    } catch (error) {
      console.error('Erro ao invalidar cache:', error);
    }
  };

  const handleRefreshCache = async () => {
    try {
      await refreshCache(itemId, accountId);
    } catch (error) {
      console.error('Erro ao atualizar cache:', error);
    }
  };

  // Mostrar apenas em desenvolvimento ou quando explicitamente solicitado
  if (process.env.NODE_ENV === 'production' && !isVisible) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 opacity-50 hover:opacity-100"
      >
        <Activity className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Cache Debug
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {cacheStats && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Cache Size:</span>
              <Badge variant="secondary">
                {cacheStats.size}/{cacheStats.maxSize}
              </Badge>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Hit Rate:</span>
              <Badge variant={cacheStats.hitRate > 0.7 ? "default" : "destructive"}>
                {(cacheStats.hitRate * 100).toFixed(1)}%
              </Badge>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Hits/Misses:</span>
              <span className="text-xs text-muted-foreground">
                {cacheStats.stats.hits}/{cacheStats.stats.misses}
              </span>
            </div>
          </div>
        )}
        
        <Separator />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshCache}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleInvalidateCache}
            className="flex-1"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
        
        {itemId && (
          <div className="text-xs text-muted-foreground">
            <div>Item: {itemId.slice(-8)}</div>
            {accountId && <div>Account: {accountId.slice(-8)}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
