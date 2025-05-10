
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useConnectionState = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [useSandbox, setUseSandbox] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  const resetConnection = () => {
    setConnectionProgress(0);
    setConnecting(false);
  };

  const updateConnectionState = (progress: number, status: string) => {
    setConnectionProgress(progress);
    setConnectionStatus(status);
  };

  const handleError = (error: any, step: string, message: string) => {
    console.error(`Erro em ${step}:`, error);
    setDebugInfo({ error, step });
    toast({
      title: "Erro",
      description: message || "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive"
    });
    resetConnection();
  };

  return {
    selectedProvider,
    setSelectedProvider,
    connecting,
    setConnecting,
    useSandbox,
    setUseSandbox,
    connectionProgress,
    connectionStatus,
    debugInfo,
    setDebugInfo,
    resetConnection,
    updateConnectionState,
    handleError,
    toast
  };
};
