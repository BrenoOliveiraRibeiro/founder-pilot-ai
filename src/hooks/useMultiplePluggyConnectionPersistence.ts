
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
    refreshingBalance,
    updatedBalances,
    lastRefreshTime,
    loadAllConnections,
    saveConnection,
    clearConnection,
    clearAllConnections,
    refreshAllBalances,
    refreshSingleConnection
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

  // Função para buscar todas as transações de uma conta
  const fetchAllAccountTransactions = useCallback(async (accountId: string) => {
    const allTransactions = [];
    let page = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      try {
        const transactionsData = await pluggyApi.fetchTransactions(accountId, page, 500);
        
        if (transactionsData?.results && transactionsData.results.length > 0) {
          allTransactions.push(...transactionsData.results);
          
          // Verificar se há mais páginas
          const totalPages = Math.ceil((transactionsData.total || 0) / 500);
          hasMorePages = page < totalPages;
          page++;
        } else {
          hasMorePages = false;
        }
      } catch (error) {
        console.error(`Erro ao buscar transações da página ${page}:`, error);
        hasMorePages = false;
      }
    }
    
    return {
      results: allTransactions,
      total: allTransactions.length
    };
  }, []);

  // Função para salvar todas as transações de todas as contas automaticamente
  const saveAllTransactionsFromAllAccounts = useCallback(async () => {
    if (!hasConnections || !currentEmpresa?.id) {
      console.log('Nenhuma conexão disponível ou empresa não encontrada');
      return;
    }

    try {
      console.log('Iniciando salvamento automático de todas as transações...');
      
      let totalNewTransactions = 0;
      let totalProcessedAccounts = 0;
      
      for (const connection of connections) {
        try {
          // Buscar dados atualizados da conexão
          const accountData = await pluggyApi.fetchAccountData(connection.itemId);
          
          if (accountData?.results) {
            for (const account of accountData.results) {
              try {
                console.log(`Processando todas as transações da conta ${account.id}...`);
                
                // Buscar TODAS as transações da conta
                const allTransactionsData = await fetchAllAccountTransactions(account.id);
                
                if (allTransactionsData.results.length > 0) {
                  const result = await processAndSaveTransactions(
                    connection.itemId,
                    account.id,
                    allTransactionsData
                  );
                  
                  if (result.success && result.newTransactions) {
                    totalNewTransactions += result.newTransactions;
                  }
                }
                
                totalProcessedAccounts++;
              } catch (error) {
                console.error(`Erro ao processar conta ${account.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error(`Erro ao processar conexão ${connection.bankName}:`, error);
        }
      }
      
      // Mostrar resultado final
      if (totalNewTransactions > 0) {
        toast({
          title: "Transações salvas automaticamente",
          description: `${totalNewTransactions} novas transações foram processadas de ${totalProcessedAccounts} conta(s).`,
        });
      } else {
        toast({
          title: "Sincronização concluída",
          description: `Todas as transações de ${totalProcessedAccounts} conta(s) já estão atualizadas.`,
        });
      }
      
      console.log(`Processamento concluído: ${totalNewTransactions} novas transações de ${totalProcessedAccounts} contas`);
      
    } catch (error: any) {
      console.error('Erro no salvamento automático:', error);
      toast({
        title: "Erro no salvamento automático",
        description: error.message || "Não foi possível processar todas as transações.",
        variant: "destructive",
      });
    }
  }, [connections, hasConnections, currentEmpresa?.id, fetchAllAccountTransactions, processAndSaveTransactions, toast]);

  const saveConnectionWithAutoProcess = useCallback(async (
    itemId: string,
    accountData: any,
    connectionToken?: string,
    bankName?: string
  ) => {
    try {
      await saveConnection(itemId, accountData, connectionToken, bankName);
      
      // Processar TODAS as transações da nova conexão
      if (accountData?.results) {
        for (const account of accountData.results) {
          try {
            console.log(`Processando todas as transações da nova conta ${account.id}...`);
            const allTransactionsData = await fetchAllAccountTransactions(account.id);
            
            if (allTransactionsData.results.length > 0) {
              await processAndSaveTransactions(itemId, account.id, allTransactionsData);
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
  }, [saveConnection, processAndSaveTransactions, fetchAllAccountTransactions]);

  return {
    // Estados básicos
    loading,
    hasConnections,
    totalConnections,
    processingTransactions,
    refreshingBalance,
    updatedBalances,
    lastRefreshTime,
    
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
    refreshAllBalances,
    refreshSingleConnection,
    processAndSaveTransactions,
    saveAllTransactionsFromAllAccounts
  };
};
