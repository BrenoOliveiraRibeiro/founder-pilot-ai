import React from 'react';
import { usePluggyWidget } from '@/hooks/usePluggyWidget';
import { PluggyUpdateView } from '@/components/pluggy/PluggyUpdateView';
import { useToast } from '@/hooks/use-toast';

export const PluggyUpdate = () => {
  const { isConnecting, isScriptLoaded, initializePluggyConnect } = usePluggyWidget();
  const { toast } = useToast();

  const handleUpdateConnection = async (itemId: string) => {
    console.log(`Iniciando atualização para item: ${itemId}`);

    await initializePluggyConnect(
      async (itemData: any) => {
        console.log('Atualização concluída com sucesso!', itemData);
        
        toast({
          title: "Conexão atualizada!",
          description: `A conexão bancária foi atualizada com sucesso.`,
          variant: "default",
        });
      },
      (error: any) => {
        console.error('Erro na atualização:', error);
        
        // Tratar erros específicos do Pluggy
        if (error.type === 'INVALID_CREDENTIALS') {
          toast({
            title: "Credenciais inválidas",
            description: "Por favor, verifique suas credenciais bancárias e tente novamente.",
            variant: "destructive",
          });
        } else if (error.type === 'MFA_REQUIRED') {
          toast({
            title: "Autenticação adicional necessária",
            description: "Siga as instruções no widget para completar a autenticação.",
            variant: "default",
          });
        } else {
          toast({
            title: "Erro na atualização",
            description: error.message || "Não foi possível atualizar a conexão. Tente novamente.",
            variant: "destructive",
          });
        }
      },
      {
        updateItemId: itemId,
        onEvent: (event: any) => {
          console.log('Evento do widget:', event);
          
          // Tratar eventos específicos
          if (event.type === 'INVALID_CREDENTIALS') {
            toast({
              title: "Credenciais necessárias",
              description: "Por segurança, precisamos confirmar seus dados. Siga as instruções na tela.",
              variant: "default",
            });
          } else if (event.type === 'MFA_REQUIRED') {
            toast({
              title: "Código de segurança",
              description: "Insira o código de autenticação solicitado pelo seu banco.",
              variant: "default",
            });
          }
        }
      }
    );
  };

  return (
    <PluggyUpdateView
      isConnecting={isConnecting}
      isScriptLoaded={isScriptLoaded}
      onUpdateConnection={handleUpdateConnection}
    />
  );
};