
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePluggyTesting = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testPluggyConnection = async (sandbox = true) => {
    setIsTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "test_connection",
          sandbox
        }
      });

      if (error) {
        throw error;
      }

      setLastTestResult(data);
      
      if (data.success) {
        toast({
          title: "Conexão com Pluggy estabelecida!",
          description: `${data.connectorsCount || 0} conectores disponíveis.`,
          variant: "success"
        });
      } else {
        toast({
          title: "Falha na conexão com Pluggy",
          description: data.message || "Verifique suas configurações e tente novamente.",
          variant: "destructive"
        });
      }
      
      return data;
    } catch (error: any) {
      console.error("Erro ao testar conexão com Pluggy:", error);
      setLastTestResult({ success: false, error: error.message });
      toast({
        title: "Erro ao testar conexão",
        description: error.message || "Ocorreu um erro ao testar a conexão com Pluggy.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    } finally {
      setIsTestingConnection(false);
    }
  };

  return {
    testPluggyConnection,
    isTestingConnection,
    lastTestResult
  };
};
