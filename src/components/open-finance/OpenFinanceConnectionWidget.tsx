
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Shield, CreditCard, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

interface OpenFinanceConnectionWidgetProps {
  onConnectionSuccess: (itemId: string, accountData: any) => void;
}

export const OpenFinanceConnectionWidget = ({ onConnectionSuccess }: OpenFinanceConnectionWidgetProps) => {
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
          title: "Erro",
          description: "Falha ao carregar o widget da Pluggy. Tente novamente.",
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

  const fetchAccountData = async (itemId: string) => {
    try {
      console.log(`Fetching account data for item: ${itemId}`);
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/accounts?itemId=${itemId}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Account data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar dados da conta. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handlePluggyConnect = async () => {
    if (!isScriptLoaded || !window.PluggyConnect) {
      toast({
        title: "Erro",
        description: "Widget da Pluggy ainda não foi carregado. Aguarde um momento.",
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

      // Create new instance
      pluggyConnectInstanceRef.current = new window.PluggyConnect({
        connectToken: tokenData.accessToken,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log('Pluggy connect success!', itemData);
          console.log('Item ID:', itemData.item.id);
          
          const receivedItemId = itemData.item.id;
          const accountData = await fetchAccountData(receivedItemId);
          
          if (accountData) {
            onConnectionSuccess(receivedItemId, accountData);
          }
          
          setIsConnecting(false);
          toast({
            title: "Conexão estabelecida!",
            description: "Sua conta bancária foi conectada com sucesso via Pluggy OpenFinance.",
          });
        },
        onError: (error: any) => {
          console.error('Pluggy Connect error:', error);
          setIsConnecting(false);
          toast({
            title: "Erro na conexão",
            description: "Ocorreu um erro ao conectar com o banco. Tente novamente.",
            variant: "destructive",
          });
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

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Conectar com Pluggy OpenFinance</CardTitle>
            <CardDescription>
              Use o widget oficial da Pluggy para conectar suas contas bancárias de forma segura
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <img 
              src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=40&h=40&fit=crop" 
              alt="Pluggy" 
              className="w-10 h-10 rounded"
            />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Integração Pluggy OpenFinance
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Conecte suas contas bancárias com segurança total usando certificação OpenFinance 
              e criptografia de ponta a ponta.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Shield className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-gray-600">Segurança Total</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-gray-600">Tempo Real</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-gray-600">Análises IA</p>
            </div>
          </div>

          <Button 
            onClick={handlePluggyConnect}
            className="w-full max-w-sm group transition-all duration-200"
            disabled={isConnecting || !isScriptLoaded}
          >
            <span className="flex items-center">
              {isConnecting ? 'Conectando...' : 'Abrir Widget Pluggy Connect'}
              {!isConnecting && <RefreshCw className="h-4 w-4 ml-2 transition-transform group-hover:rotate-180" />}
            </span>
          </Button>
          
          {!isScriptLoaded && (
            <p className="text-sm text-gray-500 mt-2">
              Carregando widget da Pluggy...
            </p>
          )}
          
          <p className="text-xs text-gray-500">
            Widget oficial da Pluggy com certificação OpenFinance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
