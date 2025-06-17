import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';
import { useFinancialDataCache } from './cache/useFinancialDataCache';

export const usePluggyDataSync = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  const { createAccountDataCache, createTransactionsCache } = useFinancialDataCache();

  const syncAccountData = useCallback(async (itemId: string) => {
    if (!currentEmpresa?.id) return null;

    try {
      console.log('Sincronizando dados da conta com cache inteligente...');
      
      const accountCache = createAccountDataCache(itemId);
      const accountData = await accountCache.getCachedData();
      
      if (accountData) {
        const { error: updateError } = await supabase
          .from('integracoes_bancarias')
          .update({ 
            account_data: accountData as any, // Cast to any to handle Json type compatibility
            ultimo_sincronismo: new Date().toISOString()
          })
          .eq('empresa_id', currentEmpresa.id)
          .eq('item_id', itemId);

        if (updateError) {
          console.error('Erro ao atualizar dados da conta:', updateError);
          throw new Error(`Erro ao atualizar dados: ${updateError.message}`);
        }

        const cacheInfo = accountCache.getCacheInfo();
        console.log('Cache stats:', cacheInfo);

        if (cacheInfo.stats.hits > 0) {
          toast({
            title: "Dados carregados do cache",
            description: "Dados bancários carregados rapidamente do cache local.",
          });
        } else {
          toast({
            title: "Dados sincronizados",
            description: "Os dados bancários foram atualizados com sucesso.",
          });
        }

        return accountData;
      }
      return null;
    } catch (error: any) {
      console.error('Erro ao sincronizar dados da conta:', error);
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
      throw error;
    }
  }, [currentEmpresa?.id, toast, createAccountDataCache]);

  const fetchAccountData = useCallback(async (itemId: string) => {
    try {
      const accountCache = createAccountDataCache(itemId);
      return await accountCache.getCachedData();
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados da conta",
        description: error.message || "Não foi possível carregar os dados da conta bancária.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast, createAccountDataCache]);

  const fetchTransactions = useCallback(async (accountId: string, itemId: string) => {
    if (!itemId) return null;

    try {
      const transactionsCache = createTransactionsCache(accountId);
      const transactionsData = await transactionsCache.getCachedData();
      
      const cacheInfo = transactionsCache.getCacheInfo();
      if (cacheInfo.stats.hits > 0) {
        console.log('Transações carregadas do cache - Cache hit rate:', cacheInfo.hitRate);
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
  }, [toast, createTransactionsCache]);

  const invalidateCache = useCallback((itemId?: string, accountId?: string) => {
    if (itemId) {
      const accountCache = createAccountDataCache(itemId);
      accountCache.invalidateCache();
    }
    
    if (accountId) {
      const transactionsCache = createTransactionsCache(accountId);
      transactionsCache.invalidateCache();
    }
  }, [createAccountDataCache, createTransactionsCache]);

  const refreshCache = useCallback(async (itemId?: string, accountId?: string) => {
    try {
      if (itemId) {
        const accountCache = createAccountDataCache(itemId);
        await accountCache.refreshCache();
      }
      
      if (accountId) {
        const transactionsCache = createTransactionsCache(accountId);
        await transactionsCache.refreshCache();
      }
      
      toast({
        title: "Cache atualizado",
        description: "Os dados foram atualizados com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cache",
        description: error.message || "Não foi possível atualizar os dados.",
        variant: "destructive",
      });
    }
  }, [createAccountDataCache, createTransactionsCache, toast]);

  return {
    syncAccountData,
    fetchAccountData,
    fetchTransactions,
    invalidateCache,
    refreshCache
  };
};
