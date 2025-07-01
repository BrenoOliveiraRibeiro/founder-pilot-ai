
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';
import { useMultiplePluggyDatabase } from './useMultiplePluggyDatabase';
import { usePluggyTransactions } from './usePluggyTransactions';
import { useBalanceRefresh } from './useBalanceRefresh';

export const useMultiplePluggyConnectionPersistence = () => {
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const {
    connections,
    allAccountData,
    hasConnections,
    totalConnections,
    loadAllConnections,
    saveConnection,
    clearConnection,
    clearAllConnections
  } = useMultiplePluggyDatabase();

  const {
    processingTransactions,
    processAndSaveTransactions
  } = usePluggyTransactions();

  const { refreshBalance } = useBalanceRefresh();

  // Carregar todas as conexões ao montar o componente
  useEffect(() => {
    const initializeConnections = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        console.log('Carregando múltiplas conexões...');
        const loadedConnections = await loadAllConnections();
        
        // Atualizar saldos de todas as conexões
        if (loadedConnections.length > 0) {
          for (const connection of loadedConnections) {
            try {
              await refreshBalance(connection.itemId, false);
            } catch (error) {
              console.error(`Erro ao atualizar saldo da conexão ${connection.bankName}:`, error);
            }
          }
          
          // Recarregar dados consolidados após refresh
          await loadAllConnections();
        }

        console.log('Inicialização de múltiplas conexões concluída');
      } catch (error: any) {
        console.error('Erro ao carregar múltiplas conexões:', error);
        toast({
          title: "Erro ao carregar conexões",
          description: error.message || "Não foi possível restaurar as conexões anteriores.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeConnections();
  }, [currentEmpresa?.id, loadAllConnections, refreshBalance, toast]);

  // Auto-selecionar primeira conta quando dados estão disponíveis
  useEffect(() => {
    if (allAccountData?.results && allAccountData.results.length > 0 && !selectedAccountId) {
      const firstAccountId = allAccountData.results[0].id;
      setSelectedAccountId(firstAccountId);
    }
  }, [allAccountData, selectedAccountId]);

  const fetchTransactions = useCallback(async (accountId: string, page: number = 1, pageSize: number = 50) => {
    try {
      const transactionsData = await pluggyApi.fetchTransactions(accountId, page, pageSize);
      setTransactionsData(transactionsData);
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
  }, [toast]);

  const getSelectedAccount = useCallback(() => {
    if (!allAccountData?.results || !selectedAccountId) return null;
    return allAccountData.results.find((account: any) => account.id === selectedAccountId);
  }, [allAccountData, selectedAccountId]);

  const syncAllConnections = useCallback(async () => {
    if (!hasConnections || !currentEmpresa?.id) return;

    try {
      console.log('Sincronizando todas as conexões...');
      
      for (const connection of connections) {
        try {
          // Refresh balance
          const updatedAccountData = await refreshBalance(connection.itemId, false);
          console.log(`Saldo atualizado para ${connection.bankName}`);
        } catch (error) {
          console.error(`Erro ao sincronizar ${connection.bankName}:`, error);
        }
      }

      // Recarregar dados consolidados
      await loadAllConnections();

      toast({
        title: "Dados sincronizados",
        description: `${totalConnections} banco(s) sincronizado(s) com sucesso.`,
      });
    } catch (error: any) {
      console.error('Erro ao sincronizar conexões:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar todas as conexões.",
        variant: "destructive",
      });
    }
  }, [connections, hasConnections, currentEmpresa?.id, refreshBalance, loadAllConnections, totalConnections, toast]);

  const saveConnectionWithAutoProcess = useCallback(async (
    itemId: string,
    accountData: any,
    connectionToken?: string,
    bankName?: string
  ) => {
    try {
      await saveConnection(itemId, accountData, connectionToken, bankName);
      
      // Processar transações da nova conexão
      if (accountData?.results) {
        for (const account of accountData.results) {
          try {
            const transactionsData = await pluggyApi.fetchTransactions(account.id, 1, 50);
            if (transactionsData?.results) {
              await processAndSaveTransactions(itemId, account.id, transactionsData);
            }
          } catch (error) {
            console.error(`Erro ao processar transações da conta ${account.id}:`, error);
          }
        }
      }
    } catch (error: any) {
      console.error('Erro ao salvar conexão com processamento automático:', error);
      throw error;
    }
  }, [saveConnection, processAndSaveTransactions]);

  return {
    // Estados básicos
    loading,
    hasConnections,
    totalConnections,
    processingTransactions,
    
    // Dados das conexões
    connections,
    allAccountData,
    
    // Conta selecionada
    selectedAccountId,
    setSelectedAccountId,
    getSelectedAccount,
    
    // Transações
    transactionsData,
    fetchTransactions,
    
    // Ações
    saveConnection: saveConnectionWithAutoProcess,
    clearConnection,
    clearAllConnections,
    syncAllConnections,
    processAndSaveTransactions
  };
};
