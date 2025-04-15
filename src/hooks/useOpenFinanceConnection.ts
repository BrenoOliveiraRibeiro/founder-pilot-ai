
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SANDBOX_PROVIDERS, REAL_PROVIDERS } from '../components/open-finance/BankProviders';
import { usePluggyConnect } from './usePluggyConnect';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';
import { useNavigate } from 'react-router-dom';

export const useOpenFinanceConnection = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();
  const connectContainerRef = useRef<HTMLDivElement>(null);
  const { pluggyWidgetLoaded, initializePluggyConnect } = usePluggyConnect();
  const { fetchIntegrations } = useOpenFinanceConnections();
  const navigate = useNavigate();

  const providers = useSandbox ? SANDBOX_PROVIDERS : REAL_PROVIDERS;

  // Auto-select first provider if none selected
  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0].id);
    }
  }, [providers, selectedProvider]);

  const handleConnect = async () => {
    if (!selectedProvider || !currentEmpresa?.id || !pluggyWidgetLoaded) {
      toast({
        title: "Erro",
        description: "Selecione um banco e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    setConnecting(true);
    setConnectionProgress(20);
    setConnectionStatus("Inicializando conexão...");
    
    try {
      // Obter token para o widget do Pluggy
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          institution: selectedProvider,
          sandbox: useSandbox
        }
      });

      if (error) throw error;
      if (!data.connect_token) throw new Error("Token não retornado");

      setConnectionProgress(40);
      setConnectionStatus("Autorizando com o banco...");

      // Inicializar e abrir o widget do Pluggy
      const onSuccess = async (itemData: { id: string }) => {
        console.log("Item criado com sucesso:", itemData.id);
        setConnectionProgress(80);
        setConnectionStatus("Conexão estabelecida, registrando...");
        await handlePluggySuccess(itemData.id);
      };

      const onError = (error: any) => {
        console.error("Erro no widget do Pluggy:", error);
        setConnectionProgress(0);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco. " + (error.message || "Erro desconhecido"),
          variant: "destructive"
        });
        setConnecting(false);
      };

      const onClose = () => {
        console.log("Widget fechado pelo usuário");
        setConnectionProgress(0);
        setConnecting(false);
      };

      // Initialize Pluggy Connect
      const pluggyConnect = await initializePluggyConnect(
        data.connect_token,
        {
          onSuccess,
          onError,
          onClose,
          connectorId: selectedProvider
        },
        connectContainerRef.current
      );

      if (!pluggyConnect) {
        throw new Error("Erro ao inicializar Pluggy Connect");
      }
      
    } catch (error: any) {
      console.error("Erro ao conectar conta:", error);
      setConnectionProgress(0);
      toast({
        title: "Erro ao conectar conta",
        description: error.message || "Não foi possível estabelecer conexão com o banco. Tente novamente.",
        variant: "destructive"
      });
      setConnecting(false);
    }
  };

  const handlePluggySuccess = async (itemId: string) => {
    if (!currentEmpresa?.id) return;
    
    try {
      setConnectionProgress(90);
      setConnectionStatus("Sincronizando dados...");
      
      // Registrar o item no backend
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          sandbox: useSandbox
        }
      });

      if (error) throw error;

      setConnectionProgress(100);
      setConnectionStatus("Concluído!");
      
      toast({
        title: "Conta conectada com sucesso!",
        description: `Sua conta foi conectada via Open Finance e os dados estão sendo sincronizados.`,
      });

      // Atualizar a lista de integrações
      await fetchIntegrations();
      await refreshEmpresas();
      
      // Redirect to dashboard after successful connection
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (error: any) {
      console.error("Erro ao registrar conexão:", error);
      toast({
        title: "Erro ao registrar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve um erro ao registrar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
      setTimeout(() => {
        setConnectionProgress(0);
      }, 1500);
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
    handleConnect
  };
};
