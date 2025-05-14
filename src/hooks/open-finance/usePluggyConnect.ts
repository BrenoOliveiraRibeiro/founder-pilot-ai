
import { useRef, useState, useEffect } from 'react';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

export const usePluggyConnect = () => {
  const [pluggyWidgetLoaded, setPluggyWidgetLoaded] = useState(false);

  // Carrega o script do Pluggy quando o componente é montado
  useEffect(() => {
    const loadPluggyScript = async () => {
      if (window.PluggyConnect) {
        setPluggyWidgetLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.pluggy.ai/pluggy-connect/pluggy-connect.js';
      script.async = true;
      
      script.onload = () => {
        console.log("Script do Pluggy carregado com sucesso");
        setPluggyWidgetLoaded(true);
      };
      
      script.onerror = () => {
        console.error("Erro ao carregar script do Pluggy");
        setPluggyWidgetLoaded(false);
      };
      
      document.body.appendChild(script);
    };

    loadPluggyScript();

    return () => {
      // Cleanup on unmount if needed
      const scriptElement = document.querySelector('script[src="https://cdn.pluggy.ai/pluggy-connect/pluggy-connect.js"]');
      if (scriptElement) {
        // Optionally remove the script when component unmounts
        // document.body.removeChild(scriptElement);
      }
    };
  }, []);

  const initializePluggyConnect = async (
    token: string, 
    options: any, 
    containerElement: HTMLDivElement
  ) => {
    if (!window.PluggyConnect) {
      console.error("Pluggy Connect não está disponível");
      return null;
    }

    try {
      console.log("Inicializando Pluggy Connect", { 
        tokenLength: token.length,
        containerExists: !!containerElement 
      });
      
      const pluggyConnect = new window.PluggyConnect({
        connectToken: token,
        ...options,
        containerEl: containerElement,
      });

      return pluggyConnect;
    } catch (error) {
      console.error("Erro ao inicializar Pluggy Connect:", error);
      return null;
    }
  };

  return { pluggyWidgetLoaded, initializePluggyConnect };
};
