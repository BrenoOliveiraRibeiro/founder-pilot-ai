
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyConnectionSchema, type PluggyConnection } from '@/schemas/validationSchemas';
import { useBalanceRefresh } from '@/hooks/useBalanceRefresh';

export interface MultiplePluggyConnection {
  id: string;
  itemId: string;
  bankName: string;
  accountData: any;
  connectionToken?: string;
  lastSync?: string;
  isConnected: boolean;
}

export const useMultiplePluggyDatabase = () => {
  const [connections, setConnections] = useState<MultiplePluggyConnection[]>([]);
  const [allAccountData, setAllAccountData] = useState<any>(null);
  const [refreshingBalance, setRefreshingBalance] = useState<string | null>(null);
  const [updatedBalances, setUpdatedBalances] = useState<Record<string, any>>({});
  const [lastRefreshTime, setLastRefreshTime] = useState<Record<string, Date>>({});
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  const { refreshBalance } = useBalanceRefresh();

  const loadAllConnections = useCallback(async () => {
    if (!currentEmpresa?.id) {
      return [];
    }

    try {
      console.log('Carregando TODAS as conexões Pluggy para empresa:', currentEmpresa.id);
      
      const { data: integracoes, error } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance')
        .eq('status', 'ativo')
        .not('item_id', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar integrações bancárias:', error);
        throw new Error(`Falha ao carregar integrações: ${error.message}`);
      }

      if (integracoes && integracoes.length > 0) {
        console.log(`${integracoes.length} conexões encontradas`);
        
        const formattedConnections: MultiplePluggyConnection[] = integracoes.map(integracao => ({
          id: integracao.id,
          itemId: integracao.item_id!,
          bankName: integracao.nome_banco || 'Banco Conectado',
          accountData: integracao.account_data,
          connectionToken: integracao.connection_token || undefined,
          lastSync: integracao.ultimo_sincronismo || undefined,
          isConnected: true
        }));

        // Consolidar todas as contas de todos os bancos
        const consolidatedAccountData = {
          results: [],
          totalBalance: 0
        };

        formattedConnections.forEach(connection => {
          // Usar dados atualizados se disponível, senão usar cache
          const accountData = updatedBalances[connection.id] || connection.accountData;
          
          if (accountData?.results) {
            // Adicionar informação do banco a cada conta
            const accountsWithBankInfo = accountData.results.map((account: any) => ({
              ...account,
              bankName: connection.bankName,
              itemId: connection.itemId
            }));
            consolidatedAccountData.results.push(...accountsWithBankInfo);
          }
        });

        // Calcular saldo total
        consolidatedAccountData.totalBalance = consolidatedAccountData.results.reduce(
          (sum: number, account: any) => sum + (account.balance || 0), 
          0
        );

        setConnections(formattedConnections);
        setAllAccountData(consolidatedAccountData);
        
        console.log(`Consolidado: ${consolidatedAccountData.results.length} contas de ${formattedConnections.length} banco(s)`);
        return formattedConnections;
      }

      console.log('Nenhuma conexão Pluggy encontrada');
      setConnections([]);
      setAllAccountData(null);
      return [];
    } catch (error: any) {
      console.error('Erro ao carregar conexões existentes:', error);
      toast({
        title: "Erro ao carregar conexões",
        description: error.message || "Não foi possível restaurar as conexões anteriores.",
        variant: "destructive",
      });
      return [];
    }
  }, [currentEmpresa?.id, toast, updatedBalances]);

  const saveConnection = useCallback(async (
    itemId: string, 
    accountData: any, 
    connectionToken?: string,
    bankName?: string
  ) => {
    if (!currentEmpresa?.id) return;

    try {
      console.log('Salvando nova conexão Pluggy:', { itemId, bankName });
      
      const { data: existing } = await supabase
        .from('integracoes_bancarias')
        .select('id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('integracoes_bancarias')
          .update({
            account_data: accountData,
            connection_token: connectionToken,
            ultimo_sincronismo: new Date().toISOString(),
            status: 'ativo'
          })
          .eq('id', existing.id);

        if (error) {
          throw new Error(`Erro ao atualizar conexão: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from('integracoes_bancarias')
          .insert({
            empresa_id: currentEmpresa.id,
            item_id: itemId,
            nome_banco: bankName || 'Banco Conectado via Pluggy',
            tipo_conexao: 'Open Finance',
            status: 'ativo',
            account_data: accountData,
            connection_token: connectionToken,
            ultimo_sincronismo: new Date().toISOString(),
            detalhes: {
              platform: 'pluggy',
              sandbox: true,
              connected_at: new Date().toISOString()
            }
          });

        if (error) {
          throw new Error(`Erro ao criar conexão: ${error.message}`);
        }
      }

      // Recarregar todas as conexões
      await loadAllConnections();
      console.log('Nova conexão Pluggy salva com sucesso');
    } catch (error: any) {
      console.error('Erro ao salvar conexão:', error);
      toast({
        title: "Erro ao salvar conexão",
        description: error.message || "Não foi possível salvar a conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [currentEmpresa?.id, loadAllConnections, toast]);

  const clearConnection = useCallback(async (itemId: string) => {
    if (!currentEmpresa?.id) return;

    try {
      const { error } = await supabase
        .from('integracoes_bancarias')
        .update({ status: 'inativo' })
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId);

      if (error) {
        throw new Error(`Erro ao desativar conexão: ${error.message}`);
      }

      // Recarregar todas as conexões
      await loadAllConnections();
      console.log('Conexão Pluggy removida');
    } catch (error: any) {
      console.error('Erro ao limpar conexão:', error);
      toast({
        title: "Erro ao limpar conexão",
        description: error.message || "Não foi possível limpar a conexão.",
        variant: "destructive",
      });
    }
  }, [currentEmpresa?.id, loadAllConnections, toast]);

  const refreshConnectionBalance = useCallback(async (connection: MultiplePluggyConnection, showToast: boolean = false) => {
    if (!connection.itemId) return null;
    
    const updatedData = await refreshBalance(
      connection.itemId, 
      showToast,
      (data) => {
        // Callback executado imediatamente quando dados são atualizados
        setUpdatedBalances(prev => ({
          ...prev,
          [connection.id]: data
        }));
        setLastRefreshTime(prev => ({
          ...prev,
          [connection.id]: new Date()
        }));
      }
    );
    
    return updatedData;
  }, [refreshBalance]);

  const refreshAllBalances = useCallback(async (showToast: boolean = false) => {
    if (connections.length === 0) return;
    
    console.log('Atualizando todos os saldos das conexões...');
    
    const refreshPromises = connections.map(async (connection) => {
      try {
        await refreshConnectionBalance(connection, false);
      } catch (error) {
        console.error(`Erro ao atualizar saldo da conexão ${connection.id}:`, error);
      }
    });
    
    await Promise.allSettled(refreshPromises);
    
    if (showToast) {
      toast({
        title: "Saldos atualizados",
        description: "Todos os saldos foram atualizados com sucesso.",
      });
    }
    
    // Recarregar conexões para sincronizar dados
    setTimeout(() => {
      loadAllConnections();
    }, 1000);
  }, [connections, refreshConnectionBalance, toast, loadAllConnections]);

  const refreshSingleConnection = useCallback(async (connection: MultiplePluggyConnection) => {
    if (!connection.itemId) return;
    
    setRefreshingBalance(connection.id);
    
    try {
      console.log(`Atualizando saldo da conexão: ${connection.bankName}`);
      await refreshConnectionBalance(connection, true);
      
      // Após refresh bem-sucedido, recarregar conexões
      setTimeout(() => {
        loadAllConnections();
      }, 500);
    } catch (error) {
      console.error(`Erro ao atualizar saldo da conexão ${connection.id}:`, error);
    } finally {
      setRefreshingBalance(null);
    }
  }, [refreshConnectionBalance, loadAllConnections]);

  // Auto-refresh dos saldos ao carregar as conexões
  useEffect(() => {
    const refreshBalancesAfterLoad = async () => {
      if (connections.length === 0) return;
      
      console.log('Auto-refresh inicial dos saldos das conexões...');
      
      const refreshPromises = connections.map(async (connection) => {
        if (connection.itemId) {
          try {
            await refreshConnectionBalance(connection, false);
          } catch (error) {
            console.error(`Erro no auto-refresh da conexão ${connection.id}:`, error);
          }
        }
      });
      
      await Promise.allSettled(refreshPromises);
    };

    if (connections.length > 0 && Object.keys(updatedBalances).length === 0) {
      refreshBalancesAfterLoad();
    }
  }, [connections, refreshConnectionBalance, updatedBalances]);

  // Auto-refresh periódico a cada 5 minutos
  useEffect(() => {
    if (connections.length === 0) return;

    const interval = setInterval(() => {
      console.log('Auto-refresh periódico dos saldos...');
      refreshAllBalances(false);
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [connections, refreshAllBalances]);

  const clearAllConnections = useCallback(async () => {
    if (!currentEmpresa?.id) return;

    try {
      const { error } = await supabase
        .from('integracoes_bancarias')
        .update({ status: 'inativo' })
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance');

      if (error) {
        throw new Error(`Erro ao desativar conexões: ${error.message}`);
      }

      setConnections([]);
      setAllAccountData(null);
      console.log('Todas as conexões Pluggy limpas');
    } catch (error: any) {
      console.error('Erro ao limpar todas as conexões:', error);
      toast({
        title: "Erro ao limpar conexões",
        description: error.message || "Não foi possível limpar as conexões.",
        variant: "destructive",
      });
    }
  }, [currentEmpresa?.id, toast]);

  return {
    connections,
    allAccountData,
    hasConnections: connections.length > 0,
    totalConnections: connections.length,
    refreshingBalance,
    updatedBalances,
    lastRefreshTime,
    loadAllConnections,
    saveConnection,
    clearConnection,
    clearAllConnections,
    refreshAllBalances,
    refreshSingleConnection
  };
};
