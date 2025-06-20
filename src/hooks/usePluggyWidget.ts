
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
  const { currentEmpresa } = useAuth();

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

    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada. Faça login novamente.",
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
      // Usar a edge function via supabase
      const { data, error } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'authorize',
          empresa_id: currentEmpresa.id,
          institution: 'pluggy',
          sandbox: true
        }
      });

      if (error) {
        throw new Error(`Erro na edge function: ${error.message}`);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Connect token response:', data);

      if (!data?.connect_token) {
        throw new Error('No connect token received');
      }

      pluggyConnectInstanceRef.current = new window.PluggyConnect({
        connectToken: data.connect_token,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log('Pluggy connect success!', itemData);
          console.log('Item ID:', itemData.item.id);
          
          setIsConnecting(false);
          
          // Chamar callback de sucesso
          await onSuccess(itemData);
        },
        onError: (error: any) => {
          console.error('Pluggy Connect error:', error);
          setIsConnecting(false);
          onError(error);
        },
        onClose: () => {
          console.log('Pluggy Connect closed');
          setIsConnecting(false);
        }
      });

      console.log('Initializing Pluggy Connect widget...');
      pluggyConnectInstanceRef.current.init();
    } catch (error) {
      console.error('Error initializing Pluggy Connect:', error);
      setIsConnecting(false);
      toast({
        title: "Erro",
        description: `Falha ao inicializar widget: ${error.message || 'Erro desconhecido'}`,
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
