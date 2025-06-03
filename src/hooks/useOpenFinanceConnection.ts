
import { useAuth } from '@/contexts/AuthContext';
import { PRODUCTION_PJ_PROVIDERS } from '../components/open-finance/BankProviders';
import { usePluggyConnect } from './open-finance/usePluggyConnect';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';
import { useProviderSelection } from './open-finance/useProviderSelection';
import { usePluggyCallbacks } from './open-finance/usePluggyCallbacks';
import { useOpenFinanceConnectionState } from './open-finance/useOpenFinanceConnectionState';
import { useOpenFinanceValidation } from './open-finance/useOpenFinanceValidation';
import { useOpenFinanceDebug } from './open-finance/useOpenFinanceDebug';
import { supabase } from '@/integrations/supabase/client';

export const useOpenFinanceConnection = () => {
  const { currentEmpresa } = useAuth();
  const { 
    pluggyWidgetLoaded, 
    loadingScript,
    loadError,
    retryCount,
    loadingStatus,
    initializePluggyConnect,
    forceReload
  } = usePluggyConnect();
  const { fetchIntegrations } = useOpenFinanceConnections();
  
  // Initialize provider selection - sempre produção
  const {
    selectedProvider,
    setSelectedProvider,
    validateProviderSelection
  } = useProviderSelection();
  
  // Connection state management
  const {
    connecting,
    setConnecting,
    connectionProgress,
    connectionStatus,
    debugInfo,
    setDebugInfo,
    connectContainerRef,
    resetConnection,
    updateConnectionState
  } = useOpenFinanceConnectionState();

  // Validation logic
  const { validateRequirements, handleError } = useOpenFinanceValidation();

  // Pluggy callbacks
  const { handlePluggySuccess } = usePluggyCallbacks();

  // Debug logging (side effects only)
  useOpenFinanceDebug(
    currentEmpresa,
    selectedProvider,
    pluggyWidgetLoaded,
    loadingScript,
    loadError,
    loadingStatus,
    retryCount,
    connecting,
    connectContainerRef
  );

  const testPluggyConnection = async () => {
    try {
      console.log("Testando conexão com Pluggy em modo produção");
      
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "test_connection",
          sandbox: false // Sempre produção
        }
      });
      
      console.log("Resultado do teste de conexão:", { data, error });
      
      if (error) {
        handleError(error, "test_connection", error.message || "Não foi possível conectar ao serviço Pluggy. Verifique suas credenciais.", setDebugInfo, resetConnection);
        return { success: false, message: error.message };
      }
      
      if (!data.success) {
        handleError({ message: data.message }, "test_connection_failed", data.message || "A conexão com Pluggy falhou. Verifique suas credenciais.", setDebugInfo, resetConnection);
        return { success: false, message: data.message };
      }
      
      // Sucesso
      updateConnectionState(0, "");
      resetConnection();
      return { success: true, connectorsCount: data.connectorsCount || 0 };
    } catch (error: any) {
      handleError(error, "test_connection", error.message || "Ocorreu um erro ao testar a conexão com Pluggy.", setDebugInfo, resetConnection);
      return { success: false, message: error.message || "Erro desconhecido" };
    }
  };

  const handleConnect = async () => {
    console.log("🚀 Iniciando conexão com API oficial...");
    console.log("Banco selecionado:", selectedProvider);
    console.log("Widget carregado:", pluggyWidgetLoaded);
    console.log("Empresa:", currentEmpresa?.id);
    
    // Validação dos requisitos básicos
    if (!validateProviderSelection() || 
        !validateRequirements(currentEmpresa, selectedProvider, pluggyWidgetLoaded, loadError, loadingScript)) {
      console.log("❌ Validação falhou");
      return;
    }
    
    setConnecting(true);
    updateConnectionState(20, "Inicializando conexão...");
    
    try {
      console.log("📡 Solicitando token para Pluggy Connect (API Oficial):", {
        empresa_id: currentEmpresa?.id,
        institution: selectedProvider,
        sandbox: false
      });
      
      // Obter token para o widget do Pluggy usando API oficial
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa?.id,
          institution: selectedProvider,
          sandbox: false
        }
      });

      console.log("📋 Resposta da API:", { data, error });

      if (error) {
        handleError(error, "authorize", "Erro na autorização com a API Pluggy", setDebugInfo, resetConnection);
        return;
      }
      
      if (!data || !data.connect_token) {
        handleError({ message: "Token não retornado" }, "token_validation", "Token de conexão não retornado pelo servidor", setDebugInfo, resetConnection);
        return;
      }

      updateConnectionState(40, "Autorizando com o banco...");

      console.log("🎯 Inicializando widget oficial para", selectedProvider);

      // Callbacks para o widget
      const onSuccess = async (itemData: { itemId: string }) => {
        console.log("✅ Item criado com sucesso:", itemData.itemId);
        updateConnectionState(80, "Conexão estabelecida, registrando...");
        await handlePluggySuccess(
          itemData.itemId, 
          false,
          updateConnectionState,
          resetConnection,
          fetchIntegrations,
          setDebugInfo
        );
      };

      const onError = (error: any) => {
        console.log("❌ Erro no widget:", error);
        handleError(error, "pluggy_widget_error", "Não foi possível conectar ao banco. " + (error.message || "Erro desconhecido"), setDebugInfo, resetConnection);
      };

      const onClose = () => {
        console.log("Widget fechado pelo usuário");
        resetConnection();
      };

      console.log("🔧 Inicializando Pluggy Connect com token oficial:", data.connect_token.substring(0, 10) + "...");
      console.log("📦 Container ref:", connectContainerRef.current);

      // Usar a implementação correta da API oficial
      const pluggyConnect = await initializePluggyConnect(
        data.connect_token,
        {
          onSuccess,
          onError,
          onClose,
          connectorId: selectedProvider,
          includeSandbox: false
        },
        connectContainerRef.current
      );

      if (!pluggyConnect) {
        handleError({ message: "Retorno nulo do inicializador Pluggy Connect" }, "initialize_pluggy_connect_null", "Erro ao inicializar Pluggy Connect", setDebugInfo, resetConnection);
        return;
      }
      
      console.log("✅ Pluggy Connect inicializado com sucesso usando API oficial");
      
    } catch (error: any) {
      console.log("❌ Erro geral:", error);
      handleError(error, "connect_account", "Não foi possível estabelecer conexão com o banco. Tente novamente.", setDebugInfo, resetConnection);
    }
  };

  // Use production providers
  const providers = PRODUCTION_PJ_PROVIDERS;

  return {
    selectedProvider,
    setSelectedProvider,
    connecting,
    connectionProgress,
    connectionStatus,
    connectContainerRef,
    pluggyWidgetLoaded,
    loadingScript,
    loadError,
    retryCount,
    loadingStatus,
    useSandbox: false,
    setUseSandbox: () => {}, // Função vazia para compatibilidade
    providers,
    handleConnect,
    testPluggyConnection,
    debugInfo,
    forceReload
  };
};
