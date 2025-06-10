
import { useState, useEffect } from "react";

declare global {
  interface Window {
    PluggyConnect?: any;
  }
}

export const usePluggyConnect = () => {
  const [pluggyWidgetLoaded, setPluggyWidgetLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Check if PluggyConnect is already loaded
    if (window.PluggyConnect) {
      console.log("Pluggy Connect já está disponível no window");
      setPluggyWidgetLoaded(true);
      return;
    }
    
    console.log("Carregando script do Pluggy Connect");
    
    // Load the Pluggy Connect script
    if (!document.getElementById("pluggy-script")) {
      const script = document.createElement("script");
      script.id = "pluggy-script";
      script.src = "https://cdn.pluggy.ai/pluggy-connect/v3.js";
      script.async = true;
      
      script.onload = () => {
        console.log("Script do Pluggy Connect carregado com sucesso");
        if (window.PluggyConnect) {
          console.log("Objeto PluggyConnect disponível na window");
          setPluggyWidgetLoaded(true);
        } else {
          console.error("Script carregado, mas objeto PluggyConnect não disponível");
          setLoadError("Script carregado, mas objeto PluggyConnect não disponível");
        }
      };
      
      script.onerror = (error) => {
        console.error("Erro ao carregar script do Pluggy Connect:", error);
        setLoadError("Falha ao carregar o script do Pluggy Connect");
      };
      
      document.head.appendChild(script);
      console.log("Script do Pluggy Connect adicionado ao documento");
    }
    
    return () => {
      // Cleanup function - no need to remove the script
      // as it should persist between component mounts
    };
  }, []);

  const initializePluggyConnect = async (
    connectToken: string,
    options: any,
    containerElement: HTMLElement | null
  ) => {
    console.log("Inicializando Pluggy Connect", { 
      tokenLength: connectToken.length,
      tokenPreview: connectToken.substring(0, 10) + "...",
      options,
      containerExists: !!containerElement
    });
    
    if (!window.PluggyConnect) {
      console.error("Pluggy Connect não está disponível na window");
      return null;
    }
    
    if (!containerElement) {
      console.error("Container para o widget não encontrado");
      return null;
    }

    try {
      console.log("Criando instância do Pluggy Connect");
      const pluggyConnect = window.PluggyConnect.init({
        connectToken,
        includeSandbox: options.includeSandbox || true,
        onSuccess: options.onSuccess,
        onError: options.onError,
        onClose: options.onClose,
        onOpen: options.onOpen,
        onLoad: options.onLoad,
        updateCredentials: options.updateCredentials,
        onEvent: options.onEvent
      });

      console.log("Instância do Pluggy Connect criada com sucesso");

      // Render the widget
      console.log("Montando widget no container");
      pluggyConnect.mount(containerElement);
      console.log("Widget montado com sucesso");
      
      return pluggyConnect;
    } catch (error) {
      console.error("Erro ao inicializar Pluggy Connect:", error);
      return null;
    }
  };

  return {
    pluggyWidgetLoaded,
    loadError,
    initializePluggyConnect
  };
};
