
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';
import { usePluggyDatabase } from './usePluggyDatabase';
import { usePluggyTransactions } from './usePluggyTransactions';

export const usePluggyConnectionPersistence = () => {
  const [loading, setLoading] = useState(true);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const {
    connectionData,
    loadExistingConnection,
    saveConnection,
    clearConnection,
    updateConnectionData
  } = usePluggyDatabase();

  const {
    processingTransactions,
    processAndSaveTransactions
  } = usePluggyTransactions();

  // Carregar conexão existente ao montar o componente
  useEffect(() => {
    const initializeConnection = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        const existingConnection = await loadExistingConnection();
        
        if (existingConnection && !existingConnection.accountData && existingConnection.itemId) {
          console.log('Buscando dados da conta via API...');
          const accountData = await pluggyApi.fetchAccountData(existingConnection.itemId);
          
          if (accountData) {
            // Atualizar dados da conta no banco
            const { error: updateError } = await supabase
              .from('integracoes_bancarias')
              .update({ 
                account_data: accountData,
                ultimo_sincronismo: new Date().toISOString()
              })
              .eq('empresa_id', currentEmpresa.id)
              .eq('item_id', existingConnection.itemId);

            if (updateError) {
              console.error('Erro ao atualizar dados da conta:', updateError);
            }

            // Atualizar estado local
            updateConnectionData({ accountData });
          }
        }

        console.log('Estado da conexão Pluggy carregado com sucesso');
      } catch (error: any) {
        console.error('Erro ao carregar conexão existente:', error);
        toast({
          title: "Erro ao carregar conexão",
          description: error.message || "Não foi possível restaurar a conexão anterior. Você pode conectar novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeConnection();
  }, [currentEmpresa?.id, loadExistingConnection, updateConnectionData, toast]);

  // Função para buscar transações via API e salvar automaticamente
  const fetchTransactions = useCallback(async (accountId: string) => {
    if (!connectionData?.itemId) return null;

    try {
      const transactionsData = await pluggyApi.fetchTransactions(accountId);
      
      // Atualizar estado local
      updateConnectionData({ transactionsData });
      
      // Processar e salvar automaticamente
      if (transactionsData && transactionsData.results && transactionsData.results.length > 0) {
        const result = await processAndSaveTransactions(connectionData.itemId, accountId, transactionsData);
        
        // Mostrar erro se o processamento falhou
        if (!result.success) {
          toast({
            title: "Erro ao salvar transações",
            description: result.message,
            variant: "destructive",
          });
        }
      }
      
      return transactionsData;
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro ao carregar transações",
        description: error.message || "Não foi possível carregar as transações.",
        variant: "destructive",
      });
      return null;
    }
  }, [connectionData?.itemId, updateConnectionData, processAndSaveTransactions, toast]);

  // Função para buscar dados da conta
  const fetchAccountData = useCallback(async (itemId: string) => {
    try {
      return await pluggyApi.fetchAccountData(itemId);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados da conta",
        description: error.message || "Não foi possível carregar os dados da conta bancária.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Sincronizar dados
  const syncData = useCallback(async () => {
    if (!connectionData?.itemId || !currentEmpresa?.id) return;

    try {
      const accountData = await pluggyApi.fetchAccountData(connectionData.itemId);
      if (accountData) {
        updateConnectionData({ accountData });
        
        const { error } = await supabase
          .from('integracoes_bancarias')
          .update({ 
            account_data: accountData,
            ultimo_sincronismo: new Date().toISOString()
          })
          .eq('empresa_id', currentEmpresa.id)
          .eq('item_id', connectionData.itemId);

        if (error) {
          throw new Error(`Erro ao atualizar sincronização: ${error.message}`);
        }

        toast({
          title: "Dados sincronizados",
          description: "Os dados bancários foram atualizados com sucesso.",
        });
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    }
  }, [connectionData?.itemId, currentEmpresa?.id, updateConnectionData, toast]);

  return {
    connectionData,
    loading,
    processingTransactions,
    saveConnection,
    clearConnection,
    syncData,
    fetchTransactions,
    fetchAccountData,
    processAndSaveTransactions
  };
};
