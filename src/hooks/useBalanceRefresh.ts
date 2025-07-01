
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';

export const useBalanceRefresh = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const refreshBalance = useCallback(async (itemId: string, showToast: boolean = false) => {
    if (!currentEmpresa?.id || !itemId) {
      console.log('Empresa ou itemId não disponível para refresh');
      return null;
    }

    try {
      console.log(`🔄 Iniciando refresh de saldo para item: ${itemId}`);
      
      // Buscar dados atualizados da API Pluggy
      const accountData = await pluggyApi.fetchAccountData(itemId);
      
      if (!accountData) {
        console.warn('Nenhum dado de conta retornado da API');
        return null;
      }

      console.log('📊 Dados da conta obtidos da API:', {
        itemId,
        totalAccounts: accountData.results?.length || 0,
        accounts: accountData.results?.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          balance: acc.balance,
          type: acc.type
        }))
      });

      // Encontrar qual banco é para logging específico
      const { data: existingIntegration } = await supabase
        .from('integracoes_bancarias')
        .select('nome_banco')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId)
        .single();

      if (existingIntegration) {
        console.log(`🏦 Atualizando dados do banco: ${existingIntegration.nome_banco}`);
        
        // Log específico para Caixa Econômica
        if (existingIntegration.nome_banco.toLowerCase().includes('caixa')) {
          console.log('🔍 CAIXA ECONÔMICA - Dados recebidos da API:', accountData);
        }
      }

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
        console.error('❌ Erro ao atualizar dados no banco:', updateError);
        throw new Error(`Falha ao salvar dados atualizados: ${updateError.message}`);
      }

      console.log('✅ Dados de conta atualizados no banco com sucesso');

      if (showToast) {
        const totalBalance = accountData.results?.reduce((sum: number, account: any) => {
          return sum + (account.balance || 0);
        }, 0) || 0;

        const bankName = existingIntegration?.nome_banco || 'Banco';

        toast({
          title: `${bankName} atualizado`,
          description: `Saldo total: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(totalBalance)}`,
        });
      }

      return accountData;
    } catch (error: any) {
      console.error('❌ Erro no refresh de saldo:', error);
      
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
