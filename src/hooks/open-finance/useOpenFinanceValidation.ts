
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook para validações da conexão Open Finance
 */
export const useOpenFinanceValidation = () => {
  const { toast } = useToast();

  const validateRequirements = (
    currentEmpresa: any,
    selectedProvider: string | null,
    pluggyWidgetLoaded: boolean,
    loadError: string | null,
    loadingScript: boolean
  ) => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Empresa não selecionada",
        description: "Você precisa ter uma empresa cadastrada para conectar sua conta bancária.",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedProvider) {
      toast({
        title: "Banco não selecionado",
        description: "Selecione um banco para continuar.",
        variant: "destructive"
      });
      return false;
    }

    if (!pluggyWidgetLoaded) {
      if (loadError) {
        toast({
          title: "Widget com erro",
          description: "O widget do Pluggy falhou ao carregar. Use o botão 'Tentar Recarregar Widget' para tentar novamente.",
          variant: "destructive"
        });
      } else if (loadingScript) {
        toast({
          title: "Widget carregando",
          description: "O widget do Pluggy ainda está carregando. Aguarde alguns segundos e tente novamente.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Widget não carregado",
          description: "O widget do Pluggy não está disponível. Tente recarregar a página.",
          variant: "destructive"
        });
      }
      return false;
    }

    return true;
  };

  const handleError = (error: any, step: string, userMessage: string, setDebugInfo: (info: any) => void, resetConnection: () => void) => {
    console.error(`❌ Erro em ${step}:`, error);
    setDebugInfo({ error, step });
    toast({
      title: "Erro",
      description: userMessage,
      variant: "destructive"
    });
    resetConnection();
  };

  return {
    validateRequirements,
    handleError
  };
};
