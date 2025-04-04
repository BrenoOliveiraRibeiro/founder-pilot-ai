
import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { SANDBOX_PROVIDERS, REAL_PROVIDERS } from '../components/open-finance/BankProviders';
import { useBelvoWidget } from './useBelvoWidget';
import { useOpenFinanceConnections } from './useOpenFinanceConnections';

declare global {
  interface Window {
    belvoSDK?: any;
  }
}

export const useOpenFinanceConnection = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [useSandbox, setUseSandbox] = useState(true);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  const belvoContainerRef = useRef<HTMLDivElement>(null);
  const { belvoWidgetLoaded } = useBelvoWidget();
  const { fetchIntegrations } = useOpenFinanceConnections();

  const providers = useSandbox ? SANDBOX_PROVIDERS : REAL_PROVIDERS;

  const handleConnect = async () => {
    if (!selectedProvider || !currentEmpresa?.id || !belvoWidgetLoaded) {
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
      // Obter token para o widget do Belvo
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          institution: selectedProvider,
          sandbox: useSandbox
        }
      });

      if (error) throw error;
      if (!data.widget_token) throw new Error("Token não retornado");

      setConnectionProgress(40);
      setConnectionStatus("Autorizando com o banco...");

      // Inicializar e abrir o widget do Belvo
      if (window.belvoSDK) {
        const successCallback = (link: string, institution: string) => {
          console.log("Link criado com sucesso:", link);
          setConnectionProgress(80);
          setConnectionStatus("Conexão estabelecida, registrando...");
          handleBelvoSuccess(link, institution);
        };

        const errorCallback = (error: any) => {
          console.error("Erro no widget do Belvo:", error);
          setConnectionProgress(0);
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao banco. Detalhes: " + (error.message || "Erro desconhecido"),
            variant: "destructive"
          });
          setConnecting(false);
        };

        const exitCallback = () => {
          console.log("Widget fechado pelo usuário");
          setConnectionProgress(0);
          setConnecting(false);
        };

        const widget = window.belvoSDK.createWidget(data.widget_token, {
          callback: (link_id: string, institution: string) => 
            successCallback(link_id, institution),
          onError: errorCallback,
          onExit: exitCallback,
          locale: "pt",
          institution: data.institution
        }).build();

        widget.mount(belvoContainerRef.current);
        
      } else {
        throw new Error("Widget do Belvo não carregado");
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

  const handleBelvoSuccess = async (linkId: string, institution: string) => {
    if (!currentEmpresa?.id) return;
    
    try {
      setConnectionProgress(90);
      setConnectionStatus("Sincronizando dados...");
      
      // Registrar o link no backend
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          empresa_id: currentEmpresa.id,
          link_id: linkId,
          institution: institution,
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
      fetchIntegrations();
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
    belvoContainerRef,
    belvoWidgetLoaded,
    useSandbox,
    setUseSandbox,
    providers,
    handleConnect
  };
};
