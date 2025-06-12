
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useOpenFinanceIntegration = () => {
  const [processing, setProcessing] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const saveIntegration = async (itemId: string, institutionName: string) => {
    if (!currentEmpresa?.id) {
      throw new Error('Nenhuma empresa selecionada');
    }

    try {
      console.log('Salvando integração no Supabase:', { itemId, institutionName });
      
      const { data, error } = await supabase
        .from('integracoes_bancarias')
        .insert([{
          empresa_id: currentEmpresa.id,
          nome_banco: institutionName,
          tipo_conexao: 'Open Finance',
          status: 'ativo',
          detalhes: {
            item_id: itemId,
            sandbox: true,
            provider: 'pluggy'
          }
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar integração:', error);
        throw error;
      }

      console.log('Integração salva com sucesso:', data);
      return data;
    } catch (error) {
      console.error('Erro ao salvar integração no Supabase:', error);
      throw error;
    }
  };

  const processFinancialData = async (itemId: string) => {
    if (!currentEmpresa?.id) {
      throw new Error('Nenhuma empresa selecionada');
    }

    try {
      console.log('Processando dados financeiros via edge function');
      setProcessing(true);

      // Step 1: Register the callback
      const { data: callbackData, error: callbackError } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'callback',
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          sandbox: true
        }
      });

      if (callbackError) {
        console.error('Erro no callback:', callbackError);
        throw new Error(`Erro no callback: ${callbackError.message}`);
      }

      console.log('Callback processado com sucesso:', callbackData);

      // Step 2: Sync financial data
      const { data: syncData, error: syncError } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'sync',
          empresa_id: currentEmpresa.id,
          sandbox: true
        }
      });

      if (syncError) {
        console.error('Erro ao sincronizar dados:', syncError);
        throw new Error(`Erro na sincronização: ${syncError.message}`);
      }

      console.log('Dados sincronizados com sucesso:', syncData);

      toast({
        title: "Dados processados!",
        description: `${syncData.transactionCount || 0} transações foram sincronizadas com sucesso.`,
      });

      return syncData;
    } catch (error) {
      console.error('Erro ao processar dados financeiros:', error);
      toast({
        title: "Erro ao processar dados",
        description: error.message || "Não foi possível processar os dados financeiros.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const getConnectToken = async (institution = 'itau') => {
    if (!currentEmpresa?.id) {
      throw new Error('Nenhuma empresa selecionada');
    }

    try {
      console.log('Obtendo token de conexão');
      
      const { data, error } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'authorize',
          empresa_id: currentEmpresa.id,
          institution: institution,
          sandbox: true
        }
      });

      if (error) {
        console.error('Erro ao obter token:', error);
        throw new Error(`Erro ao obter token: ${error.message}`);
      }

      if (!data?.connect_token) {
        throw new Error('Token de conexão não retornado');
      }

      console.log('Token de conexão obtido com sucesso');
      return data.connect_token;
    } catch (error) {
      console.error('Erro ao obter token de conexão:', error);
      throw error;
    }
  };

  return {
    processing,
    saveIntegration,
    processFinancialData,
    getConnectToken
  };
};
