
import { useState, useEffect } from "react";

declare global {
  interface Window {
    PluggyConnect?: any;
  }
}

export const usePluggyConnect = () => {
  const [pluggyWidgetLoaded, setPluggyWidgetLoaded] = useState(false);

  useEffect(() => {
    // Load the Pluggy Connect script
    if (!document.getElementById("pluggy-script")) {
      const script = document.createElement("script");
      script.id = "pluggy-script";
      script.src = "https://cdn.pluggy.ai/pluggy-connect/v2.js";
      script.async = true;
      script.onload = () => {
        console.log("Pluggy Connect script loaded");
        setPluggyWidgetLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.PluggyConnect) {
      setPluggyWidgetLoaded(true);
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
    if (!window.PluggyConnect || !containerElement) {
      console.error("Pluggy Connect não carregado ou container não encontrado");
      return null;
    }

    try {
      const pluggyConnect = await window.PluggyConnect.create({
        connectToken,
        includeSandbox: true,
        ...options
      });

      // Render the widget
      pluggyConnect.mount(containerElement);
      return pluggyConnect;
    } catch (error) {
      console.error("Erro ao inicializar Pluggy Connect:", error);
      return null;
    }
  };

  return {
    pluggyWidgetLoaded,
    initializePluggyConnect
  };
};
