
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PRODUCTION_PJ_PROVIDERS } from '../components/open-finance/BankProviders';
import { usePluggyConnect } from './open-finance/usePluggyConnect';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';
import { useProviderSelection } from './open-finance/useProviderSelection';
import { useConnectionManager } from './open-finance/useConnectionManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useOpenFinanceConnection = () => {
  const { currentEmpresa } = useAuth();
  const { pluggyWidgetLoaded, initializePluggyConnect } = usePluggyConnect();
  const { fetchIntegrations } = useOpenFinanceConnections();
  const { toast } = useToast();
  
  // Initialize provider selection - sempre produção
  const {
    selectedProvider,
    setSelectedProvider,
    validateProviderSelection
  } = useProviderSelection();
  
  // Always production mode
  const useSandbox = false;
  const setUseSandbox = () => {}; // Função vazia para compatibilidade
  
  const { 
    connecting,
    setConnecting,
    connectionProgress,
    connectionStatus,
    debugInfo,
    connectContainerRef,
    resetConnection,
    updateConnectionState,
    handleError,
    validateRequirements,
    handlePluggySuccess
  } = useConnectionManager(pluggyWidgetLoaded, initializePluggyConnect, fetchIntegrations);

  // Enhanced debug logging
  useEffect(() => {
    const selectedProviderName = PRODUCTION_PJ_PROVIDERS.find(p => p.id === selectedProvider)?.name || 'Nenhum';
    
    console.log("=== DEBUG Open Finance Connection ===");
    console.log("Empresa:", currentEmpresa ? { id: currentEmpresa.id, nome: currentEmpresa.nome } : 'Não selecionada');
    console.log("Banco selecionado:", selectedProviderName, `(ID: ${selectedProvider})`);
    console.log("Widget Pluggy carregado:", pluggyWidgetLoaded);
    console.log("Container existe:", connectContainerRef.current !== null);
    console.log("Conectando:", connecting);
    console.log("Modo:", "PRODUÇÃO");
    console.log("======================================");
    
    // Log quando usuário seleciona C6
    if (selectedProvider === 'c6-bank') {
      console.log("🏦 C6 Bank selecionado!");
      console.log("Widget status:", pluggyWidgetLoaded ? "✅ Carregado" : "❌ Não carregado");
      
      if (!pluggyWidgetLoaded) {
        toast({
          title: "Widget carregando...",
          description: "O C6 Bank foi selecionado. Aguarde o widget carregar completamente antes de conectar.",
          duration: 3000,
        });
      } else {
        toast({
          title: "C6 Bank selecionado",
          description: "Pronto para conectar! Clique em 'Conectar com Widget' para prosseguir.",
          duration: 3000,
        });
      }
    }
  }, [currentEmpresa, selectedProvider, pluggyWidgetLoaded, connecting, connectContainerRef, toast]);

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
        handleError(error, "test_connection", error.message || "Não foi possível conectar ao serviço Pluggy. Verifique suas credenciais.");
        return { success: false, message: error.message };
      }
      
      if (!data.success) {
        handleError({ message: data.message }, "test_connection_failed", data.message || "A conexão com Pluggy falhou. Verifique suas credenciais.");
        return { success: false, message: data.message };
      }
      
      // Sucesso
      updateConnectionState(0, "");
      resetConnection();
      return { success: true, connectorsCount: data.connectorsCount || 0 };
    } catch (error: any) {
      handleError(error, "test_connection", error.message || "Ocorreu um erro ao testar a conexão com Pluggy.");
      return { success: false, message: error.message || "Erro desconhecido" };
    }
  };

  const handleConnect = async () => {
    console.log("🚀 Iniciando conexão...");
    console.log("Banco selecionado:", selectedProvider);
    console.log("Widget carregado:", pluggyWidgetLoaded);
    console.log("Empresa:", currentEmpresa?.id);
    
    // Validação dos requisitos básicos
    if (!validateProviderSelection() || !validateRequirements()) {
      console.log("❌ Validação falhou");
      return;
    }
    
    if (!pluggyWidgetLoaded) {
      toast({
        title: "Widget não carregado",
        description: "O widget do Pluggy ainda está carregando. Aguarde alguns segundos e tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    setConnecting(true);
    updateConnectionState(20, "Inicializando conexão...");
    
    try {
      console.log("Solicitando token para Pluggy Connect (Produção):", {
        empresa_id: currentEmpresa?.id,
        institution: selectedProvider,
        sandbox: false
      });
      
      // Obter token para o widget do Pluggy
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa?.id,
          institution: selectedProvider,
          sandbox: false // Sempre produção
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

      console.log("🎯 Inicializando widget para", selectedProvider);

      // Inicializar e abrir o widget do Pluggy
      const onSuccess = async (itemData: { id: string }) => {
        console.log("✅ Item criado com sucesso:", itemData.id);
        updateConnectionState(80, "Conexão estabelecida, registrando...");
        await handlePluggySuccess(itemData.id, false); // Sempre produção
      };

      const onError = (error: any) => {
        console.log("❌ Erro no widget:", error);
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
          includeSandbox: false // Sempre produção
        },
        connectContainerRef.current
      );

      if (!pluggyConnect) {
        handleError({ message: "Retorno nulo do inicializador Pluggy Connect" }, "initialize_pluggy_connect_null", "Erro ao inicializar Pluggy Connect");
        return;
      }
      
      console.log("✅ Pluggy Connect inicializado com sucesso");
      
    } catch (error: any) {
      console.log("❌ Erro geral:", error);
      handleError(error, "connect_account", "Não foi possível estabelecer conexão com o banco. Tente novamente.");
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
    useSandbox: false,
    setUseSandbox,
    providers,
    handleConnect,
    testPluggyConnection,
    debugInfo
  };
};
