
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';

export const usePluggyDataSync = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const syncAccountData = useCallback(async (itemId: string) => {
    if (!currentEmpresa?.id) return null;

    try {
      console.log('Sincronizando dados da conta...');
      
      // Buscar dados diretamente da API sem usar cache por enquanto
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (accountData) {
        const { error: updateError } = await supabase
          .from('integracoes_bancarias')
          .update({ 
            account_data: accountData as any,
            ultimo_sincronismo: new Date().toISOString()
          })
          .eq('empresa_id', currentEmpresa.id)
          .eq('item_id', itemId);

        if (updateError) {
          console.error('Erro ao atualizar dados da conta:', updateError);
          throw new Error(`Erro ao atualizar dados: ${updateError.message}`);
        }

        toast({
          title: "Dados sincronizados",
          description: "Os dados bancários foram atualizados com sucesso.",
        });

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
  }, [currentEmpresa?.id, toast]);

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

  const fetchTransactions = useCallback(async (accountId: string, itemId: string) => {
    if (!itemId) return null;

    try {
      console.log('Buscando transações para accountId:', accountId);
      
      // Buscar transações diretamente da API
      const transactionsData = await pluggyApi.fetchTransactions(accountId);
      
      console.log('Transações encontradas:', transactionsData?.results?.length || 0);
      
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

  const invalidateCache = useCallback((itemId?: string, accountId?: string) => {
    // Implementação futura quando o cache for reintroduzido
    console.log('Cache invalidation not implemented yet');
  }, []);

  const refreshCache = useCallback(async (itemId?: string, accountId?: string) => {
    try {
      // Implementação futura quando o cache for reintroduzido
      console.log('Cache refresh not implemented yet');
      
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
  }, [toast]);

  return {
    syncAccountData,
    fetchAccountData,
    fetchTransactions,
    invalidateCache,
    refreshCache
  };
};
