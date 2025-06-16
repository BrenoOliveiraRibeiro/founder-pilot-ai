
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

interface ProcessedTransactionsResult {
  success: boolean;
  message: string;
  newTransactions?: number;
  totalTransactions?: number;
  skippedDuplicates?: number;
}

export const usePluggyConnectionPersistence = () => {
  const [connectionData, setConnectionData] = useState<PluggyConnectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingTransactions, setProcessingTransactions] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  // Cache para evitar re-processamento desnecessário
  const [lastSyncTimestamps, setLastSyncTimestamps] = useState<Record<string, number>>({});

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
        
        let accountData = integracao.account_data;

        if (!accountData && integracao.item_id) {
          console.log('Buscando dados da conta via API...');
          accountData = await fetchAccountData(integracao.item_id);
          
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
          transactionsData: null,
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

  // Função centralizada para processar e salvar transações automaticamente
  const processAndSaveTransactions = async (
    itemId: string, 
    accountId: string, 
    transactionsData: any
  ): Promise<ProcessedTransactionsResult> => {
    if (!currentEmpresa?.id || !transactionsData?.results || processingTransactions) {
      return { 
        success: false, 
        message: 'Dados inválidos ou processamento já em andamento' 
      };
    }

    // Verificar se passou tempo suficiente desde a última sincronização
    const cacheKey = `${itemId}_${accountId}`;
    const lastSync = lastSyncTimestamps[cacheKey];
    const now = Date.now();
    const minIntervalMs = 30000; // 30 segundos

    if (lastSync && (now - lastSync) < minIntervalMs) {
      return {
        success: true,
        message: 'Dados sincronizados recentemente.',
        newTransactions: 0,
        totalTransactions: transactionsData.results.length,
        skippedDuplicates: 0
      };
    }

    setProcessingTransactions(true);

    try {
      console.log('Processando transações automaticamente...');
      
      // Salvar transações usando a edge function
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "process_financial_data",
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          account_id: accountId,
          transactions_data: transactionsData,
          sandbox: true
        }
      });

      if (error) {
        console.error("Erro ao salvar transações:", error);
        return { 
          success: false, 
          message: 'Transações já foram salvas' 
        };
      }

      // Atualizar cache de sincronização
      setLastSyncTimestamps(prev => ({ ...prev, [cacheKey]: now }));

      console.log("Transações processadas automaticamente:", data);
      
      // Mostrar toast apenas se houver transações novas
      if (data?.newTransactions > 0) {
        toast({
          title: "Transações salvas automaticamente",
          description: `${data.newTransactions} novas transações foram processadas e salvas.`,
        });
      }

      return { 
        success: true, 
        message: data?.message || 'Transações processadas com sucesso',
        newTransactions: data?.newTransactions || 0,
        totalTransactions: transactionsData.results.length,
        skippedDuplicates: data?.duplicates || 0
      };

    } catch (error) {
      console.error("Erro ao processar transações:", error);
      return { 
        success: false, 
        message: 'Erro interno ao processar transações' 
      };
    } finally {
      setProcessingTransactions(false);
    }
  };

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

  // Função para buscar transações via API e salvar automaticamente
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
      
      // Processar e salvar automaticamente
      if (data && data.results && data.results.length > 0) {
        await processAndSaveTransactions(connectionData.itemId, accountId, data);
      }
      
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
      
      const { data: existing } = await supabase
        .from('integracoes_bancarias')
        .select('id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId)
        .single();

      if (existing) {
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
      setLastSyncTimestamps({});
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

  useEffect(() => {
    loadExistingConnection();
  }, [loadExistingConnection]);

  return {
    connectionData,
    loading,
    processingTransactions,
    saveConnection,
    clearConnection,
    syncData,
    fetchTransactions,
    fetchAccountData: (itemId: string) => fetchAccountData(itemId),
    processAndSaveTransactions
  };
};
