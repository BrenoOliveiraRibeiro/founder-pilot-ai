
import { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SANDBOX_PROVIDERS, REAL_PROVIDERS } from '../components/open-finance/BankProviders';
import { usePluggyConnect } from './usePluggyConnect';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';
import { useConnectionState } from './open-finance/useConnectionState';
import { usePluggyTesting } from './open-finance/usePluggyTesting';
import { usePluggyCallbacks } from './open-finance/usePluggyCallbacks';
import { supabase } from '@/integrations/supabase/client';

export const useOpenFinanceConnection = () => {
  const connectContainerRef = useRef<HTMLDivElement>(null);
  const { currentEmpresa } = useAuth();
  const { pluggyWidgetLoaded, initializePluggyConnect } = usePluggyConnect();
  const { fetchIntegrations } = useOpenFinanceConnections();
  const navigate = useNavigate();
  const { 
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
  } = useConnectionState();
  const { testPluggyConnection } = usePluggyTesting();
  const { handlePluggySuccess } = usePluggyCallbacks();

  const providers = useSandbox ? SANDBOX_PROVIDERS : REAL_PROVIDERS;

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
    updateConnectionState(20, "Inicializando conexão...");
    
    try {
      console.log("Solicitando token para Pluggy Connect:", {
        empresa_id: currentEmpresa.id,
        institution: selectedProvider,
        sandbox: useSandbox
      });
      
      // Obter token para o widget do Pluggy
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          institution: selectedProvider,
          sandbox: useSandbox
        }
      });

      console.log("Resposta da API:", { data, error });

      if (error) {
        handleError(error, "authorize", "Erro na autorização com a API Pluggy");
        return;
      }
      
      if (!data || !data.connect_token) {
        handleError({ message: "Token não retornado" }, "token_validation", "Token de conexão não retornado pelo servidor");
        return;
      }

      updateConnectionState(40, "Autorizando com o banco...");

      // Inicializar e abrir o widget do Pluggy
      const onSuccess = async (itemData: { id: string }) => {
        console.log("Item criado com sucesso:", itemData.id);
        updateConnectionState(80, "Conexão estabelecida, registrando...");
        await handlePluggySuccess(
          itemData.id, 
          useSandbox, 
          updateConnectionState, 
          resetConnection, 
          fetchIntegrations, 
          setDebugInfo
        );
      };

      const onError = (error: any) => {
        handleError(error, "pluggy_widget_error", "Não foi possível conectar ao banco. " + (error.message || "Erro desconhecido"));
      };

      const onClose = () => {
        console.log("Widget fechado pelo usuário");
        resetConnection();
      };

      console.log("Inicializando Pluggy Connect com token:", data.connect_token.substring(0, 10) + "...");
      console.log("Container ref:", connectContainerRef.current);

      // Initialize Pluggy Connect
      const pluggyConnect = await initializePluggyConnect(
        data.connect_token,
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
        handleError({ message: "Retorno nulo do inicializador Pluggy Connect" }, "initialize_pluggy_connect_null", "Erro ao inicializar Pluggy Connect");
        return;
      }
      
      console.log("Pluggy Connect inicializado com sucesso");
      
    } catch (error: any) {
      handleError(error, "connect_account", "Não foi possível estabelecer conexão com o banco. Tente novamente.");
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
    testPluggyConnection: () => testPluggyConnection(useSandbox),
    debugInfo
  };
};
