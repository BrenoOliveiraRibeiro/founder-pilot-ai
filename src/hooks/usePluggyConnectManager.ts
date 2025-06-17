
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

export const usePluggyConnectManager = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const pluggyConnectInstanceRef = useRef<any>(null);

  const destroyInstance = () => {
    if (pluggyConnectInstanceRef.current) {
      console.log('Destroying existing Pluggy Connect instance');
      try {
        pluggyConnectInstanceRef.current.destroy?.();
      } catch (error) {
        console.log('Error destroying previous instance:', error);
      }
      pluggyConnectInstanceRef.current = null;
    }
  };

  const fetchConnectToken = async () => {
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

    return tokenData.accessToken;
  };

  const createInstance = async (
    connectToken: string,
    onSuccess: (itemData: any) => Promise<void>,
    onError: (error: any) => void
  ) => {
    // Create new instance
    pluggyConnectInstanceRef.current = new window.PluggyConnect({
      connectToken,
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
  };

  const initializePluggyConnect = async (
    onSuccess: (itemData: any) => Promise<void>,
    onError: (error: any) => void
  ) => {
    if (!window.PluggyConnect) {
      toast({
        title: "Widget não carregado",
        description: "Widget da Pluggy ainda não foi carregado. Aguarde um momento e tente novamente.",
        variant: "destructive",
      });
      return;
    }

    // Destroy any existing instance
    destroyInstance();

    setIsConnecting(true);
    console.log("Iniciando conexão com Pluggy Connect...");

    try {
      const connectToken = await fetchConnectToken();
      await createInstance(connectToken, onSuccess, onError);
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

  const cleanup = () => {
    destroyInstance();
  };

  return {
    isConnecting,
    initializePluggyConnect,
    cleanup
  };
};
