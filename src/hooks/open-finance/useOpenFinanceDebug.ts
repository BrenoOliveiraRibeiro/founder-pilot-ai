
import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PRODUCTION_PJ_PROVIDERS } from '@/components/open-finance/BankProviders';

/**
 * Hook para debug e logs da conexão Open Finance
 */
export const useOpenFinanceDebug = (
  currentEmpresa: any,
  selectedProvider: string | null,
  pluggyWidgetLoaded: boolean,
  loadingScript: boolean,
  loadError: string | null,
  loadingStatus: string,
  retryCount: number,
  connecting: boolean,
  connectContainerRef: React.RefObject<HTMLDivElement>
) => {
  const { toast } = useToast();

  // Enhanced debug logging
  useEffect(() => {
    const selectedProviderName = PRODUCTION_PJ_PROVIDERS.find(p => p.id === selectedProvider)?.name || 'Nenhum';
    
    console.log("=== DEBUG Open Finance Connection ===");
    console.log("Empresa:", currentEmpresa ? { id: currentEmpresa.id, nome: currentEmpresa.nome } : 'Não selecionada');
    console.log("Banco selecionado:", selectedProviderName, `(ID: ${selectedProvider})`);
    console.log("Widget Pluggy carregado:", pluggyWidgetLoaded);
    console.log("Script carregando:", loadingScript);
    console.log("Erro de carregamento:", loadError);
    console.log("Status de carregamento:", loadingStatus);
    console.log("Tentativas:", retryCount);
    console.log("Container existe:", connectContainerRef.current !== null);
    console.log("Conectando:", connecting);
    console.log("Modo:", "PRODUÇÃO");
    console.log("======================================");
    
    // Log quando usuário seleciona C6
    if (selectedProvider === 'c6-bank') {
      console.log("🏦 C6 Bank selecionado!");
      console.log("Widget status:", pluggyWidgetLoaded ? "✅ Carregado" : "❌ Não carregado");
      
      if (loadError) {
        toast({
          title: "Erro no C6 Bank",
          description: "O C6 Bank foi selecionado mas o widget falhou ao carregar. Tente recarregar.",
          variant: "destructive",
          duration: 5000,
        });
      } else if (loadingScript) {
        toast({
          title: "C6 Bank selecionado",
          description: "Widget carregando... Aguarde a conclusão para conectar.",
          duration: 3000,
        });
      } else if (!pluggyWidgetLoaded) {
        toast({
          title: "Widget não carregado",
          description: "C6 Bank selecionado mas widget não está pronto. Tente recarregar.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        toast({
          title: "C6 Bank pronto!",
          description: "Clique em 'Conectar com Widget' para prosseguir com a conexão.",
          duration: 3000,
        });
      }
    }
  }, [currentEmpresa, selectedProvider, pluggyWidgetLoaded, loadingScript, loadError, loadingStatus, retryCount, connecting, connectContainerRef, toast]);

  return {
    // This hook is mainly for side effects (logging and toasts)
    // No return values needed for now
  };
};
