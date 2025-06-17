
import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface PluggyConnectionHandlerProps {
  initializePluggyConnect: (
    onSuccess: (itemData: any) => Promise<void>,
    onError: (error: any) => void
  ) => Promise<void>;
  saveConnection: (
    itemId: string,
    accountData: any,
    transactionsData?: any,
    bankName?: string
  ) => Promise<void>;
  fetchAccountData: (itemId: string) => Promise<any>;
  children: (handleConnect: () => Promise<void>) => React.ReactNode;
}

export const PluggyConnectionHandler = ({
  initializePluggyConnect,
  saveConnection,
  fetchAccountData,
  children
}: PluggyConnectionHandlerProps) => {
  const { toast } = useToast();

  const handlePluggyConnect = async () => {
    await initializePluggyConnect(
      async (itemData: any) => {
        console.log('Item ID:', itemData.item.id);
        
        try {
          // Armazenar o itemId e buscar dados da conta
          const receivedItemId = itemData.item.id;
          const accountDataResponse = await fetchAccountData(receivedItemId);
          
          // Salvar conexão
          await saveConnection(
            receivedItemId,
            accountDataResponse,
            undefined,
            'Banco via Pluggy'
          );
          
          toast({
            title: "Conexão estabelecida!",
            description: "Sua conta bancária foi conectada com sucesso. As transações serão carregadas automaticamente.",
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

  return <>{children(handlePluggyConnect)}</>;
};
