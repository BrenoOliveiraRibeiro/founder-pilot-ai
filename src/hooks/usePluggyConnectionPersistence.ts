
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

  // Função para processar automaticamente todas as contas de um item
  const autoProcessAllAccounts = useCallback(async (itemId: string, showToasts: boolean = true) => {
    if (!currentEmpresa?.id || !itemId) return;

    try {
      console.log(`Iniciando processamento automático para item ${itemId}`);
      
      // Buscar todas as contas do item
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (!accountData?.results || accountData.results.length === 0) {
        console.log('Nenhuma conta encontrada para processar');
        return;
      }

      let totalNewTransactions = 0;
      let totalProcessedAccounts = 0;

      // Processar cada conta automaticamente
      for (const account of accountData.results) {
        try {
          console.log(`Processando conta: ${account.name} (${account.id})`);
          
          // Buscar transações da conta (última página apenas para processamento inicial)
          const transactionsData = await pluggyApi.fetchTransactions(account.id, 1, 50);
          
          if (transactionsData?.results && transactionsData.results.length > 0) {
            const result = await processAndSaveTransactions(itemId, account.id, transactionsData);
            
            if (result.success) {
              totalNewTransactions += result.newTransactions || 0;
              totalProcessedAccounts++;
              console.log(`Conta ${account.name}: ${result.newTransactions} novas transações`);
            }
          }
        } catch (accountError) {
          console.error(`Erro ao processar conta ${account.id}:`, accountError);
        }
      }

      console.log(`Processamento automático concluído: ${totalNewTransactions} transações de ${totalProcessedAccounts} contas`);

      // Mostrar toast apenas se solicitado e há transações novas
      if (showToasts && totalNewTransactions > 0) {
        toast({
          title: "Transações salvas automaticamente!",
          description: `${totalNewTransactions} transações foram processadas e salvas de ${totalProcessedAccounts} conta${totalProcessedAccounts !== 1 ? 's' : ''}.`,
        });
      }

      return { totalNewTransactions, totalProcessedAccounts };
    } catch (error: any) {
      console.error('Erro no processamento automático:', error);
      
      if (showToasts) {
        toast({
          title: "Erro no processamento automático",
          description: "Algumas transações podem não ter sido salvas. Você pode sincronizar manualmente.",
          variant: "destructive",
        });
      }
    }
  }, [currentEmpresa?.id, processAndSaveTransactions, toast]);

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

            // Processar transações automaticamente para conexão existente
            await autoProcessAllAccounts(existingConnection.itemId, false);
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
  }, [currentEmpresa?.id, loadExistingConnection, updateConnectionData, autoProcessAllAccounts, toast]);

  // Função para buscar transações via API (mantém compatibilidade com a interface existente)
  const fetchTransactions = useCallback(async (accountId: string, page: number = 1, pageSize: number = 50) => {
    if (!connectionData?.itemId) return null;

    try {
      const transactionsData = await pluggyApi.fetchTransactions(accountId, page, pageSize);
      
      // Atualizar estado local
      updateConnectionData({ transactionsData });
      
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
  }, [connectionData?.itemId, updateConnectionData, toast]);

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

  // Função para salvar conexão com processamento automático
  const saveConnectionWithAutoProcess = useCallback(async (
    itemId: string,
    accountData: any,
    connectionToken?: string,
    bankName?: string
  ) => {
    try {
      // Salvar conexão primeiro
      await saveConnection(itemId, accountData, connectionToken, bankName);
      
      // Processar todas as transações automaticamente
      await autoProcessAllAccounts(itemId, true);
      
    } catch (error: any) {
      console.error('Erro ao salvar conexão com processamento automático:', error);
      toast({
        title: "Erro ao salvar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve erro no processamento automático.",
        variant: "destructive",
      });
    }
  }, [saveConnection, autoProcessAllAccounts, toast]);

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

        // Processar automaticamente todas as contas na sincronização
        await autoProcessAllAccounts(connectionData.itemId, true);

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
  }, [connectionData?.itemId, currentEmpresa?.id, updateConnectionData, autoProcessAllAccounts, toast]);

  return {
    connectionData,
    loading,
    processingTransactions,
    saveConnection: saveConnectionWithAutoProcess,
    clearConnection,
    syncData,
    fetchTransactions,
    fetchAccountData,
    processAndSaveTransactions,
    autoProcessAllAccounts
  };
};
