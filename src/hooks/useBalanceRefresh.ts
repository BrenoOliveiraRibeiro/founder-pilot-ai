
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';

export const useBalanceRefresh = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const refreshBalance = useCallback(async (itemId: string, showToast: boolean = false, onSuccess?: (data: any) => void) => {
    if (!currentEmpresa?.id || !itemId) {
      console.log('Empresa ou itemId não disponível para refresh');
      return null;
    }

    try {
      console.log(`Iniciando refresh de saldo para item: ${itemId}`);
      
      // Buscar dados atualizados da API Pluggy
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (!accountData) {
        console.warn('Nenhum dado de conta retornado da API');
        return null;
      }

      console.log('Dados da conta obtidos:', accountData);

      // Atualizar no banco de dados
      const { error: updateError } = await supabase
        .from('integracoes_bancarias')
        .update({ 
          account_data: accountData,
          ultimo_sincronismo: new Date().toISOString()
        })
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId);

      if (updateError) {
        console.error('Erro ao atualizar dados no banco:', updateError);
        throw new Error(`Falha ao salvar dados atualizados: ${updateError.message}`);
      }

      console.log('Dados de conta atualizados no banco com sucesso');

      // Callback para atualizar estado local imediatamente
      if (onSuccess) {
        onSuccess(accountData);
      }

      if (showToast) {
        // Calcular saldo apenas de contas de débito (BANK)
        const debitAccounts = accountData.results?.filter((account: any) => account.type === 'BANK') || [];
        const totalBalance = debitAccounts.reduce((sum: number, account: any) => {
          return sum + (account.balance || 0);
        }, 0);

        console.log(`Saldo atualizado - Total de contas: ${accountData.results?.length || 0}, Contas de débito: ${debitAccounts.length}, Saldo: ${totalBalance}`);

        toast({
          title: "Saldo atualizado",
          description: `Saldo em contas de débito: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(totalBalance)}`,
        });
      }

      return accountData;
    } catch (error: any) {
      console.error('Erro no refresh de saldo:', error);
      
      if (showToast) {
        toast({
          title: "Erro ao atualizar saldo",
          description: error.message || "Não foi possível atualizar o saldo.",
          variant: "destructive",
        });
      }
      
      return null;
    }
  }, [currentEmpresa?.id, toast]);

  return { refreshBalance };
};
