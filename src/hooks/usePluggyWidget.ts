
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

export const usePluggyWidget = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const pluggyConnectInstanceRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);
  const { toast } = useToast();

  useEffect(() => {
    if (window.PluggyConnect && !scriptLoadedRef.current) {
      console.log('Pluggy Connect script already available');
      setIsScriptLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }

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
          title: "Erro",
          description: "Falha ao carregar o widget da Pluggy. Tente novamente.",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);

      return () => {
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
        title: "Erro",
        description: "Widget da Pluggy ainda não foi carregado. Aguarde um momento.",
        variant: "destructive",
      });
      return;
    }

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
      pluggyAuth.clearToken();
      
      const response = await pluggyAuth.makeAuthenticatedRequest('https://api.pluggy.ai/connect_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            clientUserId: `user_${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tokenData = await response.json();
      console.log('Connect token response:', tokenData);

      if (!tokenData.accessToken) {
        throw new Error('No access token received');
      }

      pluggyConnectInstanceRef.current = new window.PluggyConnect({
        connectToken: tokenData.accessToken,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log('Pluggy connect success!', itemData);
          console.log('Item ID:', itemData.item.id);
          
          setIsConnecting(false);
          
          // Chamar callback de sucesso que irá processar automaticamente
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
    } catch (error) {
      console.error('Error fetching connect token or initializing Pluggy Connect:', error);
      setIsConnecting(false);
      toast({
        title: "Erro",
        description: `Falha ao obter token de conexão: ${error.message || 'Erro desconhecido'}`,
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
