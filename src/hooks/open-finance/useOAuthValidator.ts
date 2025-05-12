
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook para validação e tratamento de erros relacionados ao OAuth
 */
export const useOAuthValidator = () => {
  const { toast } = useToast();

  /**
   * Valida se há uma empresa selecionada
   */
  const validateCompanySelection = (currentEmpresa: any) => {
    if (!currentEmpresa?.id) {
      const message = "Você precisa ter uma empresa cadastrada para conectar sua conta bancária.";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  /**
   * Registra erro e exibe notificação
   */
  const handleError = (error: any, step: string, userMessage: string, setDebugInfo?: (info: any) => void) => {
    console.error(`Erro em ${step}:`, error);
    
    if (setDebugInfo) {
      setDebugInfo({ error, step });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    toast({
      title: "Erro",
      description: userMessage,
      variant: "destructive"
    });
    
    return { success: false, message: errorMessage };
  };

  return {
    validateCompanySelection,
    handleError
  };
};
