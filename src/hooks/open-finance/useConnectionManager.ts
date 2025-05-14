
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionManager = (
  pluggyWidgetLoaded: boolean,
  initializePluggyConnect: (token: string, options: any, containerElement: HTMLDivElement) => Promise<any>,
  fetchIntegrations: () => Promise<void>
) => {
  const [connecting, setConnecting] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const connectContainerRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentEmpresa, refreshEmpresas } = useAuth();

  const resetConnection = () => {
    setConnectionProgress(0);
    setConnecting(false);
    setConnectionStatus("");
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

  const validateRequirements = () => {
    if (!currentEmpresa?.id) {
      console.error("Nenhuma empresa selecionada");
      toast({
        title: "Erro",
        description: "Você precisa ter uma empresa cadastrada para continuar.",
        variant: "destructive"
      });
      return false;
    }
    
    if (!pluggyWidgetLoaded) {
      console.error("Pluggy Connect não carregado");
      toast({
        title: "Erro",
        description: "O widget de conexão não foi carregado. Tente recarregar a página.",
        variant: "destructive"
      });
      return false;
    }

    if (!connectContainerRef.current) {
      console.error("Container para o widget não encontrado");
      toast({
        title: "Erro",
        description: "Erro ao encontrar o container para o widget. Tente recarregar a página.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handlePluggySuccess = async (itemId: string, useSandbox: boolean) => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada para registrar a conexão",
        variant: "destructive"
      });
      resetConnection();
      return { success: false, message: "Nenhuma empresa selecionada" };
    }
    
    try {
      updateConnectionState(90, "Sincronizando dados...");
      
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
        toast({
          title: "Erro no processamento",
          description: error.message || "Ocorreu um erro ao registrar a conexão",
          variant: "destructive"
        });
        resetConnection();
        return { success: false, message: error.message };
      }

      console.log("Callback bem-sucedido:", data);
      updateConnectionState(100, "Concluído!");
      
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
      
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao registrar conexão:", error);
      setDebugInfo({ error, step: "register_connection" });
      toast({
        title: "Erro ao registrar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve um erro ao registrar. Tente novamente.",
        variant: "destructive"
      });
      resetConnection();
      return { success: false, message: error.message };
    } finally {
      setTimeout(() => {
        resetConnection();
      }, 1500);
    }
  };

  return {
    connecting,
    setConnecting,
    connectionProgress,
    connectionStatus,
    debugInfo,
    setDebugInfo,
    connectContainerRef,
    resetConnection,
    updateConnectionState,
    handleError,
    validateRequirements,
    handlePluggySuccess
  };
};
