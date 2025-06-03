
import { useState, useRef } from 'react';

/**
 * Hook para gerenciar o estado da conexão Open Finance
 */
export const useOpenFinanceConnectionState = () => {
  const [connecting, setConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const connectContainerRef = useRef<HTMLDivElement>(null);

  const resetConnection = () => {
    setConnectionProgress(0);
    setConnecting(false);
    setConnectionStatus("");
  };

  const updateConnectionState = (progress: number, status: string) => {
    setConnectionProgress(progress);
    setConnectionStatus(status);
  };

  return {
    connecting,
    setConnecting,
    connectionProgress,
    connectionStatus,
    debugInfo,
    setDebugInfo,
    connectContainerRef,
    resetConnection,
    updateConnectionState
  };
};
