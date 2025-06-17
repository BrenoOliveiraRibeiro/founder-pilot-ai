
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
      console.log('Buscando dados da conta via API...');
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (accountData) {
        const { error: updateError } = await supabase
          .from('integracoes_bancarias')
          .update({ 
            account_data: accountData,
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
      const transactionsData = await pluggyApi.fetchTransactions(accountId);
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

  return {
    syncAccountData,
    fetchAccountData,
    fetchTransactions
  };
};
