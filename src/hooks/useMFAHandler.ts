import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';

interface MFAState {
  isRequired: boolean;
  type: string;
  parameter?: string;
  qrCodeData?: string;
  itemId?: string;
}

export const useMFAHandler = () => {
  const [mfaState, setMfaState] = useState<MFAState>({
    isRequired: false,
    type: '',
    parameter: undefined,
    qrCodeData: undefined,
    itemId: undefined
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkMFAStatus = useCallback(async (itemId: string) => {
    try {
      console.log(`Verificando status MFA para item: ${itemId}`);
      
      const itemStatus = await pluggyApi.fetchItemStatus(itemId);
      
      if (itemStatus?.status === 'WAITING_USER_INPUT' && itemStatus?.parameter) {
        console.log('MFA necessário:', itemStatus);
        
        setMfaState({
          isRequired: true,
          type: itemStatus.parameter,
          parameter: itemStatus.parameter_name || itemStatus.parameter,
          qrCodeData: itemStatus.qr_code_data,
          itemId: itemId
        });
        
        return true; // MFA é necessário
      }
      
      return false; // MFA não é necessário
    } catch (error: any) {
      console.error('Erro ao verificar status MFA:', error);
      toast({
        title: "Erro ao verificar autenticação",
        description: "Não foi possível verificar se autenticação adicional é necessária.",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const submitMFA = useCallback(async (
    mfaData: { type: string; parameter?: string; value?: string },
    onSuccess?: () => void
  ) => {
    if (!mfaState.itemId) {
      throw new Error('Item ID não encontrado para envio do MFA');
    }

    setLoading(true);
    
    try {
      console.log('Enviando MFA:', mfaData);
      
      await pluggyApi.sendMFA(mfaState.itemId, mfaData);
      
      // Aguardar um pouco e verificar status novamente
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const needsMFA = await checkMFAStatus(mfaState.itemId);
      
      if (!needsMFA) {
        // MFA bem-sucedido, limpar estado
        setMfaState({
          isRequired: false,
          type: '',
          parameter: undefined,
          qrCodeData: undefined,
          itemId: undefined
        });
        
        toast({
          title: "Autenticação concluída",
          description: "A autenticação adicional foi realizada com sucesso.",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Ainda precisa de MFA, pode ser outro tipo
        toast({
          title: "Autenticação em andamento",
          description: "Por favor, complete a próxima etapa de autenticação.",
        });
      }
    } catch (error: any) {
      console.error('Erro ao enviar MFA:', error);
      
      let errorMessage = "Não foi possível completar a autenticação.";
      
      if (error.message.includes('403')) {
        errorMessage = "Código inválido. Verifique e tente novamente.";
      } else if (error.message.includes('timeout')) {
        errorMessage = "Tempo limite excedido. Tente novamente.";
      }
      
      toast({
        title: "Erro na autenticação",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mfaState.itemId, checkMFAStatus, toast]);

  const clearMFA = useCallback(() => {
    setMfaState({
      isRequired: false,
      type: '',
      parameter: undefined,
      qrCodeData: undefined,
      itemId: undefined
    });
  }, []);

  const retryConnection = useCallback(async (itemId: string, onSuccess?: () => void) => {
    try {
      // Verificar se ainda precisa de MFA
      const needsMFA = await checkMFAStatus(itemId);
      
      if (!needsMFA) {
        // Conexão bem-sucedida
        clearMFA();
        
        toast({
          title: "Conexão estabelecida",
          description: "A conexão com o banco foi estabelecida com sucesso.",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
      
      return !needsMFA;
    } catch (error: any) {
      console.error('Erro ao tentar reconectar:', error);
      toast({
        title: "Erro na reconexão",
        description: "Não foi possível verificar o status da conexão.",
        variant: "destructive"
      });
      return false;
    }
  }, [checkMFAStatus, clearMFA, toast]);

  return {
    mfaState,
    loading,
    checkMFAStatus,
    submitMFA,
    clearMFA,
    retryConnection
  };
};