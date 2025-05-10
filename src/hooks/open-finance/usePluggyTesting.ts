
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const usePluggyTesting = () => {
  const { toast } = useToast();

  const testPluggyConnection = async (useSandbox: boolean) => {
    try {
      console.log("Testando conexão com Pluggy", { sandbox: useSandbox });
      
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
        return { success: false, message: error.message };
      }
      
      if (!data.success) {
        toast({
          title: "Falha no teste de conexão",
          description: data.message || "A conexão com Pluggy falhou. Verifique suas credenciais.",
          variant: "destructive"
        });
        return { success: false, message: data.message };
      }
      
      toast({
        title: "Conexão com Pluggy estabelecida",
        description: `${data.connectorsCount || 0} conectores disponíveis.`,
      });
      
      return { success: true, connectorsCount: data.connectorsCount || 0 };
    } catch (error: any) {
      console.error("Erro ao testar conexão:", error);
      toast({
        title: "Erro no teste",
        description: error.message || "Ocorreu um erro ao testar a conexão com Pluggy.",
        variant: "destructive"
      });
      return { success: false, message: error.message || "Erro desconhecido" };
    }
  };

  return { testPluggyConnection };
};
