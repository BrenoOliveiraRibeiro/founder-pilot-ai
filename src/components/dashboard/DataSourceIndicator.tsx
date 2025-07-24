import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Database, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

interface DataSourceIndicatorProps {
  isUsingFallback: boolean;
  connectionStatus: 'connected' | 'expired' | 'error';
  onReconnect?: () => void;
  numTransactions?: number;
  lastSyncDate?: string | null;
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  isUsingFallback,
  connectionStatus,
  onReconnect,
  numTransactions,
  lastSyncDate
}) => {
  if (!isUsingFallback && connectionStatus === 'connected') {
    return null; // Tudo funcionando normalmente
  }

  const getIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4" />;
      case 'expired':
        return <WifiOff className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    if (connectionStatus === 'error') return 'destructive';
    if (connectionStatus === 'expired') return 'default';
    return 'default';
  };

  const getMessage = () => {
    if (isUsingFallback) {
      return `Exibindo dados calculados a partir de ${numTransactions} transações. Conexões bancárias podem estar expiradas.`;
    }
    if (connectionStatus === 'expired') {
      return 'Suas conexões bancárias expiraram. Reconecte para dados em tempo real.';
    }
    if (connectionStatus === 'error') {
      return 'Erro ao acessar dados bancários. Verifique sua conexão.';
    }
    return 'Dados parciais disponíveis.';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Alert variant={getVariant()} className="border-l-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <div>
              <AlertDescription className="text-sm">
                {getMessage()}
                {lastSyncDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Última sincronização: {new Date(lastSyncDate).toLocaleString('pt-BR')}
                  </div>
                )}
              </AlertDescription>
            </div>
          </div>
          
          {onReconnect && (connectionStatus === 'expired' || connectionStatus === 'error') && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReconnect}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Reconectar
            </Button>
          )}
        </div>
      </Alert>
    </motion.div>
  );
};