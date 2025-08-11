
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';
import { usePluggyDatabase } from './usePluggyDatabase';
import { usePluggyTransactions } from './usePluggyTransactions';
import { useBalanceRefresh } from './useBalanceRefresh';

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

  const { refreshBalance } = useBalanceRefresh();

  // Função para processar automaticamente todas as transações de todas as páginas
  const autoProcessAllAccountsAllPages = useCallback(async (itemId: string, showToasts: boolean = true) => {
    if (!currentEmpresa?.id || !itemId) return;

    try {
      console.log(`Iniciando processamento completo de todas as transações para item ${itemId}`);
      
      // Buscar todas as contas do item
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (!accountData?.results || accountData.results.length === 0) {
        console.log('Nenhuma conta encontrada para processar');
        return;
      }

      let totalNewTransactions = 0;
      let totalProcessedAccounts = 0;

      // Processar cada conta com todas as suas transações
      for (const account of accountData.results) {
        try {
          console.log(`Processando todas as transações da conta: ${account.name} (${account.id})`);
          
          let allAccountTransactions = [];
          let currentPage = 1;
          let hasMorePages = true;
          const pageSize = 100;

          // Buscar todas as páginas de transações da conta
          while (hasMorePages) {
            try {
              const transactionsData = await pluggyApi.fetchTransactions(account.id, currentPage, pageSize);
              
              if (transactionsData?.results && transactionsData.results.length > 0) {
                allAccountTransactions = [...allAccountTransactions, ...transactionsData.results];
                
                const totalPages = Math.ceil((transactionsData.total || transactionsData.results.length) / pageSize);
                hasMorePages = currentPage < totalPages && transactionsData.results.length === pageSize;
                currentPage++;
                
                console.log(`Página ${currentPage - 1} da conta ${account.name}: ${transactionsData.results.length} transações`);
              } else {
                hasMorePages = false;
              }
            } catch (pageError) {
              console.error(`Erro ao buscar página ${currentPage} da conta ${account.id}:`, pageError);
              hasMorePages = false;
            }
          }

          // Processar todas as transações coletadas da conta
          if (allAccountTransactions.length > 0) {
            console.log(`Total de transações coletadas da conta ${account.name}: ${allAccountTransactions.length}`);
            
            const result = await processAndSaveTransactions(itemId, account.id, {
              results: allAccountTransactions,
              total: allAccountTransactions.length
            });
            
            if (result.success) {
              totalNewTransactions += result.newTransactions || 0;
              totalProcessedAccounts++;
              console.log(`Conta ${account.name}: ${result.newTransactions} novas transações de ${allAccountTransactions.length} totais`);
            }
          } else {
            console.log(`Nenhuma transação encontrada para a conta ${account.name}`);
          }
        } catch (accountError) {
          console.error(`Erro ao processar conta ${account.id}:`, accountError);
        }
      }

      console.log(`Processamento completo concluído: ${totalNewTransactions} novas transações de ${totalProcessedAccounts} contas`);

      if (showToasts) {
        if (totalNewTransactions > 0) {
          toast({
            title: "Todas as transações salvas!",
            description: `${totalNewTransactions} novas transações foram processadas de ${totalProcessedAccounts} conta${totalProcessedAccounts !== 1 ? 's' : ''}.`,
          });
        } else {
          toast({
            title: "Transações verificadas",
            description: `Todas as transações de ${totalProcessedAccounts} conta${totalProcessedAccounts !== 1 ? 's' : ''} já estão salvas no sistema.`,
          });
        }
      }

      return { totalNewTransactions, totalProcessedAccounts };
    } catch (error: any) {
      console.error('Erro no processamento completo:', error);
      
      if (showToasts) {
        toast({
          title: "Erro no processamento automático",
          description: "Algumas transações podem não ter sido salvas. Você pode sincronizar manualmente.",
          variant: "destructive",
        });
      }
    }
  }, [currentEmpresa?.id, processAndSaveTransactions, toast]);

  // Função para processar automaticamente todas as contas de um item (compatibilidade)
  const autoProcessAllAccounts = useCallback(async (itemId: string, showToasts: boolean = true) => {
    if (!currentEmpresa?.id || !itemId) return;

    try {
      console.log(`Iniciando processamento automático para item ${itemId}`);
      
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (!accountData?.results || accountData.results.length === 0) {
        console.log('Nenhuma conta encontrada para processar');
        return;
      }

      let totalNewTransactions = 0;
      let totalProcessedAccounts = 0;

      for (const account of accountData.results) {
        try {
          console.log(`Processando conta: ${account.name} (${account.id})`);
          
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
        console.log('Carregando conexão existente...');
        const existingConnection = await loadExistingConnection();
        
        if (existingConnection && existingConnection.itemId) {
          console.log('Conexão existente encontrada, atualizando saldo...');
          
          // SEMPRE buscar dados atualizados da API ao carregar a página
          const updatedAccountData = await refreshBalance(existingConnection.itemId, false);
          
          if (updatedAccountData) {
            // Atualizar estado local com dados atualizados
            updateConnectionData({ accountData: updatedAccountData });
            console.log('Dados da conta atualizados com sucesso');
          } else if (existingConnection.accountData) {
            // Fallback para dados existentes se refresh falhar
            console.log('Usando dados existentes como fallback');
            updateConnectionData({ accountData: existingConnection.accountData });
          }

        // Chamar sincronização automática via edge function para garantir consistência
        try {
          console.log('Iniciando sincronização automática via edge function...');
          const { data: syncResult, error: syncError } = await supabase.functions.invoke('open-finance', {
            body: {
              action: 'sync_data',
              empresa_id: currentEmpresa.id,
              sandbox: true
            }
          });

          if (syncError) {
            console.error('Erro na sincronização automática:', syncError);
          } else {
            console.log('Sincronização automática concluída:', syncResult);
          }
        } catch (syncError) {
          console.error('Erro ao chamar sincronização automática:', syncError);
        }

        // Processar transações automaticamente como fallback
        await autoProcessAllAccountsAllPages(existingConnection.itemId, false);
        }

        console.log('Inicialização da conexão concluída');
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
  }, [currentEmpresa?.id, loadExistingConnection, updateConnectionData, autoProcessAllAccountsAllPages, refreshBalance, toast]);

  // Função para buscar transações via API
  const fetchTransactions = useCallback(async (accountId: string, page: number = 1, pageSize: number = 50) => {
    if (!connectionData?.itemId) return null;

    try {
      const transactionsData = await pluggyApi.fetchTransactions(accountId, page, pageSize);
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

  // Função para salvar conexão com processamento automático completo
  const saveConnectionWithAutoProcess = useCallback(async (
    itemId: string,
    accountData: any,
    connectionToken?: string,
    bankName?: string
  ) => {
    try {
      await saveConnection(itemId, accountData, connectionToken, bankName);
      await autoProcessAllAccountsAllPages(itemId, true);
    } catch (error: any) {
      console.error('Erro ao salvar conexão com processamento automático:', error);
      toast({
        title: "Erro ao salvar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve erro no processamento automático.",
        variant: "destructive",
      });
    }
  }, [saveConnection, autoProcessAllAccountsAllPages, toast]);

  // Sincronizar dados com refresh de saldo
  const syncData = useCallback(async () => {
    if (!connectionData?.itemId || !currentEmpresa?.id) return;

    try {
      console.log('Iniciando sincronização com refresh de saldo...');
      
      // Buscar dados atualizados da API Pluggy
      const updatedAccountData = await refreshBalance(connectionData.itemId, false);
      
      if (updatedAccountData) {
        // Atualizar estado local imediatamente
        updateConnectionData({ accountData: updatedAccountData });
        console.log('Estado local atualizado com novos dados da conta');
        
        // Processar automaticamente TODAS as transações na sincronização
        await autoProcessAllAccountsAllPages(connectionData.itemId, false);

        toast({
          title: "Dados sincronizados",
          description: "Os dados bancários e saldo foram atualizados com sucesso.",
        });
      } else {
        throw new Error('Não foi possível obter dados atualizados da API');
      }
    } catch (error: any) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    }
  }, [connectionData?.itemId, currentEmpresa?.id, updateConnectionData, autoProcessAllAccountsAllPages, refreshBalance, toast]);

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
    autoProcessAllAccounts,
    autoProcessAllAccountsAllPages
  };
};
