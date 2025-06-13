
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
  const [debugInfo, setDebugInfo] = useState<any>(null);
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
      const onSuccess = async (itemData: { id: string }) => {
        console.log("Item criado com sucesso:", itemData.id);
        setConnectionProgress(80);
        setConnectionStatus("Conexão estabelecida, registrando...");
        await handlePluggySuccess(itemData.id);
      };

      const onError = (error: any) => {
        console.error("Erro no widget do Pluggy:", error);
        setDebugInfo({ error, step: "pluggy_widget_error" });
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
        console.error("Retorno nulo do inicializador Pluggy Connect");
        setDebugInfo({ step: "initialize_pluggy_connect_null" });
        throw new Error("Erro ao inicializar Pluggy Connect");
      }
      
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
      setConnectionStatus("Sincronizando dados...");
      
      console.log("Registrando item no backend:", itemId);
      
      // Buscar informações do provedor selecionado
      const selectedProviderInfo = providers.find(p => p.id === selectedProvider);
      const providerName = selectedProviderInfo?.name || selectedProvider || 'Banco Conectado';
      
      // Criar registro na tabela integracoes_bancarias
      const { data: integrationData, error: integrationError } = await supabase
        .from("integracoes_bancarias")
        .insert([
          {
            empresa_id: currentEmpresa.id,
            nome_banco: providerName,
            tipo_conexao: "Open Finance",
            status: "ativo",
            ultimo_sincronismo: new Date().toISOString(),
            detalhes: { 
              item_id: itemId,
              provider_id: selectedProvider,
              sandbox: useSandbox,
              created_via: "pluggy_widget"
            }
          }
        ])
        .select()
        .single();

      if (integrationError) {
        console.error("Erro ao criar integração:", integrationError);
        throw new Error("Falha ao registrar a integração bancária");
      }

      console.log("Integração criada com sucesso:", integrationData);

      // Registrar o item no backend via callback (opcional para sincronização adicional)
      const { data: callbackData, error: callbackError } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          sandbox: useSandbox
        }
      });

      if (callbackError) {
        console.warn("Aviso no callback (não crítico):", callbackError);
        // Não interromper o fluxo por erro no callback
      } else {
        console.log("Callback executado com sucesso:", callbackData);
      }

      setConnectionProgress(100);
      setConnectionStatus("Concluído!");
      
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
        setConnectionProgress(0);
      }, 1500);
    }
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
    debugInfo
  };
};
