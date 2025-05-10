
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePluggyCallbacks = () => {
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handlePluggySuccess = async (
    itemId: string,
    useSandbox: boolean,
    updateConnectionState: (progress: number, status: string) => void,
    resetConnection: () => void,
    fetchIntegrations: () => Promise<void>,
    setDebugInfo: (info: any) => void
  ) => {
    if (!currentEmpresa?.id) return;
    
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
        throw error;
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
      
    } catch (error: any) {
      console.error("Erro ao registrar conexão:", error);
      setDebugInfo({ error, step: "register_connection" });
      toast({
        title: "Erro ao registrar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve um erro ao registrar. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      resetConnection();
      setTimeout(() => {
        updateConnectionState(0, "");
      }, 1500);
    }
  };

  return { handlePluggySuccess };
};
