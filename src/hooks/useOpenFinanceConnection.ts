
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SANDBOX_PROVIDERS, REAL_PROVIDERS } from '../components/open-finance/BankProviders';
import { useConnectionProgress } from './useConnectionProgress';
import { usePluggyConnection } from './usePluggyConnection';

export const useOpenFinanceConnection = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const providers = useSandbox ? SANDBOX_PROVIDERS : REAL_PROVIDERS;
  
  const { 
    connectionProgress, 
    connectionStatus, 
    updateProgress, 
    resetProgress 
  } = useConnectionProgress();

  const {
    connectContainerRef,
    pluggyWidgetLoaded,
    handleConnect
  } = usePluggyConnection({
    selectedProvider,
    providers,
    useSandbox,
    updateProgress,
    resetProgress,
    setConnecting,
    setDebugInfo
  });

  // Auto-select first provider if none selected
  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0].id);
    }
  }, [providers, selectedProvider]);

  // Debug current state
  useEffect(() => {
    console.log("Open Finance Connection State:", {
      currentEmpresa: currentEmpresa ? { id: currentEmpresa.id, nome: currentEmpresa.nome } : null,
      selectedProvider,
      pluggyWidgetLoaded,
      connecting,
      useSandbox,
      containerExists: connectContainerRef.current !== null,
    });
  }, [currentEmpresa, selectedProvider, pluggyWidgetLoaded, connecting, useSandbox]);

  const testPluggyConnection = async () => {
    try {
      updateProgress(0, "Testando conexão com Pluggy...");
      console.log("Testando conexão com Pluggy");
      
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "test_connection",
          sandbox: useSandbox
        }
      });
      
      console.log("Resultado do teste de conexão:", { data, error });
      
      if (error) {
        toast({
          title: "Erro no teste de conexão",
          description: error.message || "Não foi possível conectar ao serviço Pluggy. Verifique suas credenciais.",
          variant: "destructive"
        });
        return false;
      }
      
      if (!data.success) {
        toast({
          title: "Falha no teste de conexão",
          description: data.message || "A conexão com Pluggy falhou. Verifique suas credenciais.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Conexão com Pluggy estabelecida",
        description: `${data.connectorsCount || 0} conectores disponíveis.`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      toast({
        title: "Erro no teste",
        description: error.message || "Ocorreu um erro ao testar a conexão com Pluggy.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    selectedProvider,
    setSelectedProvider,
    connecting,
    connectionProgress,
    connectionStatus,
    connectContainerRef,
    pluggyWidgetLoaded,
    useSandbox,
    setUseSandbox,
    providers,
    handleConnect,
    testPluggyConnection,
    debugInfo
  };
};
