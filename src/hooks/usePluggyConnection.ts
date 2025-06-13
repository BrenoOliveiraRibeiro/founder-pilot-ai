
import { useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { usePluggyConnect } from './usePluggyConnect';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';
import { useNavigate } from 'react-router-dom';
import { createBankIntegration, executeCallback, requestPluggyToken } from '@/utils/openFinanceHelpers';

interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  popular: boolean;
}

interface UsePluggyConnectionProps {
  selectedProvider: string | null;
  providers: ProviderInfo[];
  useSandbox: boolean;
  updateProgress: (progress: number, status: string) => void;
  resetProgress: () => void;
  setConnecting: (connecting: boolean) => void;
  setDebugInfo: (info: any) => void;
}

export const usePluggyConnection = ({
  selectedProvider,
  providers,
  useSandbox,
  updateProgress,
  resetProgress,
  setConnecting,
  setDebugInfo
}: UsePluggyConnectionProps) => {
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();
  const connectContainerRef = useRef<HTMLDivElement>(null);
  const { pluggyWidgetLoaded, initializePluggyConnect } = usePluggyConnect();
  const { fetchIntegrations } = useOpenFinanceConnections();
  const navigate = useNavigate();

  const handlePluggySuccess = async (itemId: string) => {
    if (!currentEmpresa?.id) return;
    
    try {
      updateProgress(90, "Sincronizando dados...");
      
      console.log("Registrando item no backend:", itemId);
      
      // Criar integração bancária
      await createBankIntegration(
        currentEmpresa.id,
        itemId,
        selectedProvider!,
        providers,
        useSandbox
      );

      // Executar callback opcional
      await executeCallback(currentEmpresa.id, itemId, useSandbox);

      updateProgress(100, "Concluído!");
      
      const selectedProviderInfo = providers.find(p => p.id === selectedProvider);
      const providerName = selectedProviderInfo?.name || selectedProvider || 'Banco Conectado';
      
      toast({
        title: "Conta conectada com sucesso!",
        description: `Sua conta ${providerName} foi conectada via Open Finance e está pronta para sincronização.`,
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
      setDebugInfo({ error, step: "register_connection" });
      toast({
        title: "Erro ao registrar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve um erro ao registrar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
      setTimeout(() => {
        resetProgress();
      }, 1500);
    }
  };

  const handleConnect = async () => {
    if (!selectedProvider) {
      toast({
        title: "Erro",
        description: "Selecione um banco para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentEmpresa?.id) {
      console.error("Nenhuma empresa selecionada");
      toast({
        title: "Erro",
        description: "Você precisa ter uma empresa cadastrada para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    if (!pluggyWidgetLoaded) {
      console.error("Pluggy Connect não carregado");
      toast({
        title: "Erro",
        description: "O widget de conexão não foi carregado. Tente recarregar a página.",
        variant: "destructive"
      });
      return;
    }

    if (!connectContainerRef.current) {
      console.error("Container para o widget não encontrado");
      toast({
        title: "Erro",
        description: "Erro ao encontrar o container para o widget. Tente recarregar a página.",
        variant: "destructive"
      });
      return;
    }

    setConnecting(true);
    updateProgress(20, "Inicializando conexão...");
    
    try {
      // Obter token para o widget do Pluggy
      const connectToken = await requestPluggyToken(
        currentEmpresa.id,
        selectedProvider,
        useSandbox
      );

      updateProgress(40, "Autorizando com o banco...");

      // Callbacks para o widget
      const onSuccess = async (itemData: { id: string }) => {
        console.log("Item criado com sucesso:", itemData.id);
        updateProgress(80, "Conexão estabelecida, registrando...");
        await handlePluggySuccess(itemData.id);
      };

      const onError = (error: any) => {
        console.error("Erro no widget do Pluggy:", error);
        setDebugInfo({ error, step: "pluggy_widget_error" });
        resetProgress();
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao banco. " + (error.message || "Erro desconhecido"),
          variant: "destructive"
        });
        setConnecting(false);
      };

      const onClose = () => {
        console.log("Widget fechado pelo usuário");
        resetProgress();
        setConnecting(false);
      };

      console.log("Inicializando Pluggy Connect com token:", connectToken.substring(0, 10) + "...");

      // Initialize Pluggy Connect
      const pluggyConnect = await initializePluggyConnect(
        connectToken,
        {
          onSuccess,
          onError,
          onClose,
          connectorId: selectedProvider,
          includeSandbox: useSandbox
        },
        connectContainerRef.current
      );

      if (!pluggyConnect) {
        console.error("Retorno nulo do inicializador Pluggy Connect");
        setDebugInfo({ step: "initialize_pluggy_connect_null" });
        throw new Error("Erro ao inicializar Pluggy Connect");
      }
      
      console.log("Pluggy Connect inicializado com sucesso");
      
    } catch (error: any) {
      console.error("Erro ao conectar conta:", error);
      resetProgress();
      toast({
        title: "Erro ao conectar conta",
        description: error.message || "Não foi possível estabelecer conexão com o banco. Tente novamente.",
        variant: "destructive"
      });
      setConnecting(false);
    }
  };

  return {
    connectContainerRef,
    pluggyWidgetLoaded,
    handleConnect
  };
};
