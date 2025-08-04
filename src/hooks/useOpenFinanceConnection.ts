import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SANDBOX_PROVIDERS, REAL_PROVIDERS } from '../components/open-finance/BankProviders';
import { usePluggyWidget } from './usePluggyWidget';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';
import { useNavigate } from 'react-router-dom';
import { useMFAHandler } from './useMFAHandler';

export const useOpenFinanceConnection = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();
  const connectContainerRef = useRef<HTMLDivElement>(null);
  const { isScriptLoaded: pluggyWidgetLoaded, initializePluggyConnect } = usePluggyWidget();
  const { fetchIntegrations } = useOpenFinanceConnections();
  const navigate = useNavigate();
  
  // MFA Handler
  const { 
    mfaState, 
    loading: mfaLoading, 
    checkMFAStatus, 
    submitMFA, 
    clearMFA, 
    retryConnection 
  } = useMFAHandler();

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
    setConnectionProgress(20);
    setConnectionStatus("Inicializando conexão...");
    
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
        console.error("Erro na autorização:", error);
        setDebugInfo({ error, step: "authorize" });
        throw error;
      }
      
      if (!data || !data.connect_token) {
        console.error("Token não retornado:", data);
        setDebugInfo({ data, step: "token_validation" });
        throw new Error("Token de conexão não retornado pelo servidor");
      }

      setConnectionProgress(40);
      setConnectionStatus("Autorizando com o banco...");

      // Inicializar e abrir o widget do Pluggy
      await initializePluggyConnect(
        async (itemData: { item: { id: string } }) => {
          console.log("Item criado com sucesso:", itemData.item.id);
          setConnectionProgress(80);
          setConnectionStatus("Conexão estabelecida, registrando...");
          await handlePluggySuccess(itemData.item.id);
        },
        (error: any) => {
          console.error("Erro no widget do Pluggy:", error);
          setDebugInfo({ error, step: "pluggy_widget_error" });
          setConnectionProgress(0);
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao banco. " + (error.message || "Erro desconhecido"),
            variant: "destructive"
          });
          setConnecting(false);
        }
      );
      
      console.log("Pluggy Connect inicializado com sucesso");
      
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
      setConnectionStatus("Verificando autenticação...");
      
      console.log("Verificando se MFA é necessário para item:", itemId);
      
      // Verificar se MFA é necessário
      const needsMFA = await checkMFAStatus(itemId);
      
      if (needsMFA) {
        setConnectionStatus("Autenticação adicional necessária");
        setConnecting(false);
        setConnectionProgress(0);
        console.log("MFA necessário, aguardando entrada do usuário");
        return;
      }
      
      setConnectionStatus("Registrando conexão...");
      console.log("Registrando item no backend:", itemId);
      
      // Registrar o item no backend
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          sandbox: useSandbox
        }
      });

      if (error) {
        console.error("Erro no callback:", error);
        setDebugInfo({ error, step: "callback" });
        throw error;
      }

      console.log("Callback bem-sucedido:", data);
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
      setDebugInfo({ error, step: "register_connection" });
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

  const handleMFASubmit = async (mfaData: { type: string; parameter?: string; value?: string }) => {
    await submitMFA(mfaData, async () => {
      // MFA bem-sucedido, continuar com o processo de conexão
      if (mfaState.itemId) {
        setConnecting(true);
        setConnectionProgress(90);
        setConnectionStatus("Finalizando conexão...");
        await handlePluggySuccess(mfaState.itemId);
      }
    });
  };

  const testPluggyConnection = async () => {
    try {
      setConnectionStatus("Testando conexão com Pluggy...");
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
    debugInfo,
    // MFA functionality
    mfaState,
    mfaLoading,
    handleMFASubmit,
    clearMFA
  };
};
