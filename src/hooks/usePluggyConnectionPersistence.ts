
import { useCallback } from 'react';
import { usePluggyConnectionManager } from './usePluggyConnectionManager';
import { usePluggyTransactions } from './usePluggyTransactions';
import { usePluggyDataSync } from './usePluggyDataSync';

export const usePluggyConnectionPersistence = () => {
  const {
    connectionData,
    loading,
    saveConnection,
    clearConnection,
    updateConnectionData,
    fetchAccountData: fetchAccountDataFromSync
  } = usePluggyConnectionManager();

  const {
    processingTransactions,
    processAndSaveTransactions
  } = usePluggyTransactions();

  const { fetchTransactions: fetchTransactionsFromAPI, syncAccountData } = usePluggyDataSync();

  // Função para buscar transações via API e salvar automaticamente
  const fetchTransactions = useCallback(async (accountId: string) => {
    if (!connectionData?.itemId) return null;

    try {
      const transactionsData = await fetchTransactionsFromAPI(accountId, connectionData.itemId);
      
      // Atualizar estado local
      updateConnectionData({ transactionsData });
      
      // Processar e salvar automaticamente
      if (transactionsData && transactionsData.results && transactionsData.results.length > 0) {
        const result = await processAndSaveTransactions(connectionData.itemId, accountId, transactionsData);
        
        // Mostrar erro se o processamento falhou
        if (!result.success) {
          console.error('Erro ao processar transações:', result.message);
        }
      }
      
      return transactionsData;
    } catch (error: any) {
      console.error('Erro no fetchTransactions:', error);
      return null;
    }
  }, [connectionData?.itemId, fetchTransactionsFromAPI, updateConnectionData, processAndSaveTransactions]);

  // Função para buscar dados da conta
  const fetchAccountData = useCallback(async (itemId: string) => {
    return await fetchAccountDataFromSync(itemId);
  }, [fetchAccountDataFromSync]);

  // Função para sincronização de dados (compatibilidade com OpenFinance.tsx)
  const syncData = useCallback(async () => {
    if (!connectionData?.itemId) return;

    try {
      const accountData = await syncAccountData(connectionData.itemId);
      
      if (accountData) {
        updateConnectionData({ accountData });
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
    }
  }, [connectionData?.itemId, syncAccountData, updateConnectionData]);

  return {
    connectionData,
    loading,
    processingTransactions,
    saveConnection,
    clearConnection,
    fetchTransactions,
    fetchAccountData,
    processAndSaveTransactions,
    syncData
  };
};
