
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

export const usePluggyWidget = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { toast } = useToast();
  
  const pluggyConnectInstanceRef = useRef<any>(null);
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

      return () => {
        // Cleanup on unmount
        if (pluggyConnectInstanceRef.current) {
          try {
            pluggyConnectInstanceRef.current.destroy?.();
          } catch (error) {
            console.log('Error destroying Pluggy Connect instance:', error);
          }
          pluggyConnectInstanceRef.current = null;
        }
      };
    }
  }, [toast]);

  const initializePluggyConnect = async (
    onSuccess: (itemData: any) => Promise<void>,
    onError: (error: any) => void
  ) => {
    if (!isScriptLoaded || !window.PluggyConnect) {
      toast({
        title: "Widget não carregado",
        description: "Widget da Pluggy ainda não foi carregado. Aguarde um momento e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Destroy any existing instance
    if (pluggyConnectInstanceRef.current) {
      console.log('Destroying existing Pluggy Connect instance');
      try {
        pluggyConnectInstanceRef.current.destroy?.();
      } catch (error) {
        console.log('Error destroying previous instance:', error);
      }
      pluggyConnectInstanceRef.current = null;
    }

    setIsConnecting(true);
    console.log("Iniciando conexão com Pluggy Connect...");

    try {
      // Clear any cached token to force fresh authentication
      pluggyAuth.clearToken();
      
      // Fetch connect token from Pluggy API using authenticated request
      const response = await pluggyAuth.makeAuthenticatedRequest('https://api.pluggy.ai/connect_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            clientUserId: `user_${Date.now()}`, // Use unique user ID
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }

      const tokenData = await response.json();
      console.log('Connect token response:', tokenData);

      if (!tokenData.accessToken) {
        throw new Error('Token de acesso não recebido da API Pluggy');
      }

      // Create new instance
      pluggyConnectInstanceRef.current = new window.PluggyConnect({
        connectToken: tokenData.accessToken,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log('Pluggy connect success!', itemData);
          setIsConnecting(false);
          await onSuccess(itemData);
        },
        onError: (error: any) => {
          console.error('Pluggy Connect error:', error);
          setIsConnecting(false);
          onError(error);
        },
      });

      console.log('Initializing Pluggy Connect widget...');
      pluggyConnectInstanceRef.current.init();
    } catch (error: any) {
      console.error('Error fetching connect token or initializing Pluggy Connect:', error);
      setIsConnecting(false);
      
      let errorMessage = "Falha ao obter token de conexão.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro de inicialização",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return {
    isConnecting,
    isScriptLoaded,
    initializePluggyConnect
  };
};
