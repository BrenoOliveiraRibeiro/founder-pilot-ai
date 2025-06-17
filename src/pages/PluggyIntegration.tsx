
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePluggyConnectionPersistence } from '@/hooks/usePluggyConnectionPersistence';
import { usePluggyWidget } from '@/hooks/usePluggyWidget';
import { PluggyConnectedView } from '@/components/pluggy/PluggyConnectedView';
import { PluggyConnectionView } from '@/components/pluggy/PluggyConnectionView';

const PluggyIntegration = () => {
  const { toast } = useToast();
  
  const {
    connectionData,
    loading,
    processingTransactions,
    saveConnection,
    fetchTransactions,
    fetchAccountData
  } = usePluggyConnectionPersistence();
  
  const {
    isConnecting,
    isScriptLoaded,
    initializePluggyConnect
  } = usePluggyWidget();

  const isConnected = connectionData?.isConnected || false;

  const handlePluggyConnect = async () => {
    await initializePluggyConnect(
      async (itemData: any) => {
        console.log('Item ID:', itemData.item.id);
        
        try {
          // Buscar dados da conta
          const receivedItemId = itemData.item.id;
          const accountDataResponse = await fetchAccountData(receivedItemId);
          
          // saveConnection agora inclui processamento automático completo
          await saveConnection(
            receivedItemId,
            accountDataResponse,
            undefined,
            'Banco via Pluggy'
          );
          
          toast({
            title: "Conexão estabelecida!",
            description: "Sua conta bancária foi conectada e todas as transações foram salvas automaticamente.",
          });
        } catch (error: any) {
          console.error('Erro ao processar sucesso da conexão:', error);
          toast({
            title: "Erro ao salvar conexão",
            description: error.message || "A conexão foi estabelecida, mas houve erro ao salvar os dados.",
            variant: "destructive",
          });
        }
      },
      (error: any) => {
        let errorMessage = "Ocorreu um erro ao conectar com o banco.";
        if (error && error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        toast({
          title: "Erro na conexão",
          description: errorMessage,
          variant: "destructive",
        });
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (isConnected && connectionData && connectionData.itemId && connectionData.accountData) {
    const typedConnectionData = {
      itemId: connectionData.itemId,
      accountData: connectionData.accountData,
      transactionsData: connectionData.transactionsData,
      isConnected: connectionData.isConnected,
      connectionToken: connectionData.connectionToken,
    };

    return (
      <PluggyConnectedView
        connectionData={typedConnectionData}
        processingTransactions={processingTransactions}
        fetchTransactions={fetchTransactions}
      />
    );
  }

  return (
    <PluggyConnectionView
      isConnecting={isConnecting}
      isScriptLoaded={isScriptLoaded}
      onConnect={handlePluggyConnect}
    />
  );
};

export default PluggyIntegration;
