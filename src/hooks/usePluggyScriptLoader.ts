
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

export const usePluggyScriptLoader = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if script is already loaded
    if (window.PluggyConnect && !scriptLoadedRef.current) {
      console.log('Pluggy Connect script already available');
      setIsScriptLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }

    // Only load script if not already loaded
    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js';
      script.async = true;
      script.onload = () => {
        console.log('Pluggy Connect script loaded');
        setIsScriptLoaded(true);
        scriptLoadedRef.current = true;
      };
      script.onerror = () => {
        console.error('Failed to load Pluggy Connect script');
        toast({
          title: "Erro ao carregar widget",
          description: "Falha ao carregar o widget da Pluggy. Verifique sua conexão e tente novamente.",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);
    }
  }, [toast]);

  return {
    isScriptLoaded
  };
};
