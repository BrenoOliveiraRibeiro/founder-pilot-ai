
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
          const pageSize = 100; // Usar páginas maiores para eficiência

          // Buscar todas as páginas de transações da conta
          while (hasMorePages) {
            try {
              const transactionsData = await pluggyApi.fetchTransactions(account.id, currentPage, pageSize);
              
              if (transactionsData?.results && transactionsData.results.length > 0) {
                allAccountTransactions = [...allAccountTransactions, ...transactionsData.results];
                
                // Verificar se há mais páginas
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

      // Mostrar toast apenas se solicitado
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

            // Processar TODAS as transações automaticamente quando a página carregar
            await autoProcessAllAccountsAllPages(existingConnection.itemId, true);
          }
        } else if (existingConnection && existingConnection.itemId) {
          // Se já temos dados da conta, ainda assim processar todas as transações
          await autoProcessAllAccountsAllPages(existingConnection.itemId, true);
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
  }, [currentEmpresa?.id, loadExistingConnection, updateConnectionData, autoProcessAllAccountsAllPages, toast]);

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

  // Função para salvar conexão com processamento automático completo
  const saveConnectionWithAutoProcess = useCallback(async (
    itemId: string,
    accountData: any,
    connectionToken?: string,
    bankName?: string
  ) => {
    try {
      // Salvar conexão primeiro
      await saveConnection(itemId, accountData, connectionToken, bankName);
      
      // Processar TODAS as transações automaticamente
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

        // Processar automaticamente TODAS as transações na sincronização
        await autoProcessAllAccountsAllPages(connectionData.itemId, true);

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
  }, [connectionData?.itemId, currentEmpresa?.id, updateConnectionData, autoProcessAllAccountsAllPages, toast]);

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
