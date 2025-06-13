import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

interface PluggyConnectionData {
  itemId: string;
  accountData: any;
  transactionsData: any;
  isConnected: boolean;
  connectionToken?: string;
}

export const usePluggyConnectionPersistence = () => {
  const [connectionData, setConnectionData] = useState<PluggyConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  // Carregar conexão existente ao montar o componente
  const loadExistingConnection = useCallback(async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Carregando conexão Pluggy existente para empresa:', currentEmpresa.id);
      
      const { data: integracoes, error } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance')
        .eq('status', 'ativo')
        .not('item_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (integracoes && integracoes.length > 0) {
        const integracao = integracoes[0];
        console.log('Conexão existente encontrada:', integracao.nome_banco);
        
        // Tentar restaurar dados da conta se disponíveis
        let accountData = integracao.account_data;
        let transactionsData = null;

        // Se não temos dados salvos, buscar da API
        if (!accountData && integracao.item_id) {
          console.log('Buscando dados da conta via API...');
          accountData = await fetchAccountData(integracao.item_id);
          
          // Salvar os dados buscados
          if (accountData) {
            await supabase
              .from('integracoes_bancarias')
              .update({ 
                account_data: accountData,
                ultimo_sincronismo: new Date().toISOString()
              })
              .eq('id', integracao.id);
          }
        }

        setConnectionData({
          itemId: integracao.item_id!,
          accountData,
          transactionsData,
          isConnected: true,
          connectionToken: integracao.connection_token || undefined
        });

        console.log('Estado da conexão Pluggy restaurado com sucesso');
      } else {
        console.log('Nenhuma conexão Pluggy existente encontrada');
      }
    } catch (error) {
      console.error('Erro ao carregar conexão existente:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível restaurar a conexão anterior. Você pode conectar novamente.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  }, [currentEmpresa?.id, toast]);

  // Função para buscar dados da conta via API
  const fetchAccountData = async (itemId: string) => {
    try {
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/accounts?itemId=${itemId}`,
        {
          method: 'GET',
          headers: { accept: 'application/json' }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados da conta carregados via API:', data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados da conta:', error);
      return null;
    }
  };

  // Função para verificar e filtrar transações duplicadas
  const filterDuplicateTransactions = async (transactions: any[], empresaId: string) => {
    if (!transactions || transactions.length === 0) return [];

    try {
      // Buscar transações existentes dos últimos 6 meses para comparação
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: existingTransactions, error } = await supabase
        .from('transacoes')
        .select('descricao, valor, data_transacao')
        .eq('empresa_id', empresaId)
        .gte('data_transacao', sixMonthsAgo.toISOString().split('T')[0]);

      if (error) {
        console.error('Erro ao buscar transações existentes:', error);
        return transactions; // Se houver erro, retorna todas as transações
      }

      // Criar um Set de chaves únicas das transações existentes
      const existingKeys = new Set(
        existingTransactions?.map(tx => 
          `${tx.descricao}_${tx.valor}_${tx.data_transacao}`
        ) || []
      );

      // Filtrar apenas transações que não existem
      const newTransactions = transactions.filter(tx => {
        const key = `${tx.description || 'Transação'}_${tx.amount}_${tx.date}`;
        return !existingKeys.has(key);
      });

      console.log(`Filtradas ${transactions.length - newTransactions.length} transações duplicadas`);
      return newTransactions;
    } catch (error) {
      console.error('Erro ao filtrar duplicatas:', error);
      return transactions; // Em caso de erro, retorna todas as transações
    }
  };

  // Função para buscar transações via API
  const fetchTransactions = async (accountId: string) => {
    if (!connectionData?.itemId) return null;

    try {
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/transactions?accountId=${accountId}`,
        {
          method: 'GET',
          headers: { accept: 'application/json' }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Transações carregadas:', data);
      
      // Atualizar estado local
      setConnectionData(prev => prev ? { ...prev, transactionsData: data } : null);
      
      return data;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return null;
    }
  };

  // Salvar nova conexão
  const saveConnection = useCallback(async (
    itemId: string, 
    accountData: any, 
    connectionToken?: string,
    bankName?: string
  ) => {
    if (!currentEmpresa?.id) return;

    try {
      console.log('Salvando nova conexão Pluggy:', { itemId, bankName });
      
      // Verificar se já existe uma integração para este item
      const { data: existing } = await supabase
        .from('integracoes_bancarias')
        .select('id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        // Atualizar existente
        await supabase
          .from('integracoes_bancarias')
          .update({
            account_data: accountData,
            connection_token: connectionToken,
            ultimo_sincronismo: new Date().toISOString(),
            status: 'ativo'
          })
          .eq('id', existing.id);
      } else {
        // Criar nova integração
        await supabase
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
      }

      // Atualizar estado local
      setConnectionData({
        itemId,
        accountData,
        transactionsData: null,
        isConnected: true,
        connectionToken
      });

      console.log('Conexão Pluggy salva com sucesso');
    } catch (error) {
      console.error('Erro ao salvar conexão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [currentEmpresa?.id, toast]);

  // Limpar conexão
  const clearConnection = useCallback(async () => {
    if (!currentEmpresa?.id || !connectionData?.itemId) return;

    try {
      await supabase
        .from('integracoes_bancarias')
        .update({ status: 'inativo' })
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', connectionData.itemId);

      setConnectionData(null);
      console.log('Conexão Pluggy limpa');
    } catch (error) {
      console.error('Erro ao limpar conexão:', error);
    }
  }, [currentEmpresa?.id, connectionData?.itemId]);

  // Sincronizar dados
  const syncData = useCallback(async () => {
    if (!connectionData?.itemId) return;

    try {
      const accountData = await fetchAccountData(connectionData.itemId);
      if (accountData) {
        setConnectionData(prev => prev ? { ...prev, accountData } : null);
        
        // Salvar dados atualizados
        await supabase
          .from('integracoes_bancarias')
          .update({ 
            account_data: accountData,
            ultimo_sincronismo: new Date().toISOString()
          })
          .eq('empresa_id', currentEmpresa!.id)
          .eq('item_id', connectionData.itemId);

        toast({
          title: "Dados sincronizados",
          description: "Os dados bancários foram atualizados com sucesso.",
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    }
  }, [connectionData?.itemId, currentEmpresa?.id, toast]);

  // Nova função para salvar transações sem duplicatas
  const saveTransactionsToDatabase = async (itemId: string, accountId: string, transactionsData: any) => {
    if (!currentEmpresa?.id || !transactionsData?.results) return { success: false, message: 'Dados inválidos' };

    try {
      console.log('Verificando duplicatas antes de salvar transações...');
      
      // Filtrar transações duplicadas
      const filteredTransactions = await filterDuplicateTransactions(
        transactionsData.results,
        currentEmpresa.id
      );

      if (filteredTransactions.length === 0) {
        console.log('Nenhuma transação nova para salvar');
        return { 
          success: true, 
          message: 'Todas as transações já estão salvas no banco de dados',
          newTransactions: 0,
          totalTransactions: transactionsData.results.length
        };
      }

      // Chamar edge function para processar apenas as transações novas
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "process_financial_data",
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          account_id: accountId,
          transactions_data: { results: filteredTransactions },
          sandbox: true
        }
      });

      if (error) {
        console.error("Erro ao salvar transações:", error);
        return { success: false, message: 'Erro ao salvar no banco de dados' };
      }

      console.log("Transações salvas com sucesso:", data);
      return { 
        success: true, 
        message: `${filteredTransactions.length} novas transações salvas`,
        newTransactions: filteredTransactions.length,
        totalTransactions: transactionsData.results.length,
        data 
      };

    } catch (error) {
      console.error("Erro ao processar transações:", error);
      return { success: false, message: 'Erro interno ao processar transações' };
    }
  };

  useEffect(() => {
    loadExistingConnection();
  }, [loadExistingConnection]);

  return {
    connectionData,
    loading,
    saveConnection,
    clearConnection,
    syncData,
    fetchTransactions,
    fetchAccountData: (itemId: string) => fetchAccountData(itemId),
    saveTransactionsToDatabase
  };
};
