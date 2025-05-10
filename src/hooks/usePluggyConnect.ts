
import { useState, useEffect } from "react";
import { useToast } from '@/components/ui/use-toast';

declare global {
  interface Window {
    PluggyConnect?: any;
  }
}

/**
 * Hook responsável por gerenciar o carregamento do script do Pluggy Connect
 * e fornecer métodos para inicializar o widget
 */
export const usePluggyConnect = () => {
  const [pluggyWidgetLoaded, setPluggyWidgetLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const { toast } = useToast();

  // Responsabilidade: Carregar o script Pluggy Connect
  useEffect(() => {
    const loadPluggyScript = async () => {
      // Script já carregado
      if (window.PluggyConnect) {
        console.log("Pluggy Connect já está disponível no window");
        setPluggyWidgetLoaded(true);
        return;
      }
      
      // Script em carregamento
      if (loadingScript) {
        return;
      }
      
      console.log("Carregando script do Pluggy Connect");
      setLoadingScript(true);
      
      try {
        // Carrega o script do Pluggy Connect
        if (!document.getElementById("pluggy-script")) {
          const script = document.createElement("script");
          script.id = "pluggy-script";
          script.src = "https://cdn.pluggy.ai/pluggy-connect/v2.js";
          script.async = true;
          
          // Define handlers para sucesso e erro
          script.onload = () => {
            console.log("Script do Pluggy Connect carregado com sucesso");
            if (window.PluggyConnect) {
              console.log("Objeto PluggyConnect disponível na window");
              setPluggyWidgetLoaded(true);
              setLoadError(null);
              toast({
                description: "Pluggy Connect carregado com sucesso",
              });
            } else {
              const error = "Script carregado, mas objeto PluggyConnect não disponível";
              console.error(error);
              setLoadError(error);
              toast({
                title: "Erro ao carregar Pluggy Connect",
                description: error,
                variant: "destructive"
              });
            }
            setLoadingScript(false);
          };
          
          script.onerror = (error) => {
            const errorMessage = "Falha ao carregar o script do Pluggy Connect";
            console.error(errorMessage, error);
            setLoadError(errorMessage);
            setLoadingScript(false);
            toast({
              title: "Erro",
              description: errorMessage,
              variant: "destructive"
            });
          };
          
          document.head.appendChild(script);
          console.log("Script do Pluggy Connect adicionado ao documento");
        }
      } catch (error) {
        const errorMessage = "Erro inesperado ao carregar script do Pluggy Connect";
        console.error(errorMessage, error);
        setLoadError(errorMessage);
        setLoadingScript(false);
        toast({
          title: "Erro crítico",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };
    
    loadPluggyScript();
  }, [toast]);

  // Responsabilidade: Inicializar o widget do Pluggy Connect
  const initializePluggyConnect = async (
    connectToken: string,
    options: any,
    containerElement: HTMLElement | null
  ) => {
    console.log("Inicializando Pluggy Connect", { 
      tokenLength: connectToken?.length || 0,
      tokenPreview: connectToken ? `${connectToken.substring(0, 10)}...` : 'Token não fornecido',
      options,
      containerExists: !!containerElement
    });
    
    // Validações
    if (!connectToken) {
      const error = "Token de conexão não fornecido";
      console.error(error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }
    
    if (!window.PluggyConnect) {
      const error = "Pluggy Connect não está disponível na window";
      console.error(error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }
    
    if (!containerElement) {
      const error = "Container para o widget não encontrado";
      console.error(error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log("Criando instância do Pluggy Connect");
      const pluggyConnect = await window.PluggyConnect.create({
        connectToken,
        includeSandbox: options.includeSandbox ?? true,
        ...options
      });

      console.log("Instância do Pluggy Connect criada com sucesso");

      // Renderiza o widget
      console.log("Montando widget no container");
      pluggyConnect.mount(containerElement);
      console.log("Widget montado com sucesso");
      
      return pluggyConnect;
    } catch (error: any) {
      console.error("Erro ao inicializar Pluggy Connect:", error);
      toast({
        title: "Falha na inicialização",
        description: error.message || "Erro ao inicializar o widget do Pluggy Connect",
        variant: "destructive"
      });
      return null;
    }
  };

  // Responsabilidade: Verificar se o Pluggy Connect está pronto para uso
  const isPluggyReady = () => {
    if (!pluggyWidgetLoaded) {
      if (loadError) {
        toast({
          title: "Pluggy Connect não está disponível",
          description: loadError,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Pluggy Connect não está pronto",
          description: "O widget ainda está sendo carregado, aguarde alguns instantes.",
          variant: "destructive"
        });
      }
      return false;
    }
    return true;
  };

  return {
    pluggyWidgetLoaded,
    loadError,
    loadingScript,
    initializePluggyConnect,
    isPluggyReady
  };
};
