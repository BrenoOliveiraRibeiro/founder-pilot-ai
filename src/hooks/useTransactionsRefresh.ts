import { useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyApi } from '@/utils/pluggyApi';
import { usePluggyTransactions } from './usePluggyTransactions';
import { useQueryClient } from '@tanstack/react-query';

export const useTransactionsRefresh = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  const { processAndSaveTransactions } = usePluggyTransactions();
  const queryClient = useQueryClient();

  const refreshTransactions = useCallback(async (showToast: boolean = false) => {
    if (!currentEmpresa?.id) {
      console.log('Empresa não disponível para refresh de transações');
      return;
    }

    try {
      console.log('Iniciando refresh automático de transações...');
      
      // Buscar todas as integrações ativas do Open Finance
      const { data: integrations, error: integrationsError } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance')
        .eq('status', 'conectado');

      if (integrationsError) {
        console.error('Erro ao buscar integrações:', integrationsError);
        return;
      }

      if (!integrations || integrations.length === 0) {
        console.log('Nenhuma integração ativa encontrada');
        return;
      }

      let totalNewTransactions = 0;
      let processedIntegrations = 0;

      // Para cada integração ativa, buscar e processar transações
      for (const integration of integrations) {
        if (!integration.item_id || !integration.account_data) {
          continue;
        }

        try {
          // Parse account data
          const accountData = integration.account_data as any;
          if (!accountData?.results) continue;

          // Para cada conta da integração
          for (const account of accountData.results) {
            if (!account.id) continue;

            console.log(`Buscando transações para conta ${account.id}...`);
            
            // Buscar transações da API Pluggy
            const transactionsData = await pluggyApi.fetchTransactions(account.id, 1, 50);
            
            if (transactionsData?.results && transactionsData.results.length > 0) {
              // Processar e salvar transações
              const result = await processAndSaveTransactions(
                integration.item_id,
                account.id,
                transactionsData
              );
              
              if (result.success && result.newTransactions) {
                totalNewTransactions += result.newTransactions;
              }
            }
          }
          
          processedIntegrations++;
        } catch (error) {
          console.error(`Erro ao processar integração ${integration.id}:`, error);
          // Continue com outras integrações mesmo se uma falhar
        }
      }

      // Invalidar cache do React Query para forçar refresh dos dados
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });

      console.log(`Refresh concluído: ${totalNewTransactions} novas transações de ${processedIntegrations} integrações`);

      if (showToast && totalNewTransactions > 0) {
        toast({
          title: "Transações atualizadas",
          description: `${totalNewTransactions} novas transações foram encontradas e salvas.`,
        });
      }

      return { newTransactions: totalNewTransactions, processedIntegrations };
    } catch (error: any) {
      console.error('Erro no refresh de transações:', error);
      
      if (showToast) {
        toast({
          title: "Erro ao atualizar transações",
          description: error.message || "Não foi possível atualizar as transações.",
          variant: "destructive",
        });
      }
      
      return null;
    }
  }, [currentEmpresa?.id, toast, processAndSaveTransactions, queryClient]);

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!currentEmpresa?.id) return;

    // Refresh inicial (silencioso)
    refreshTransactions(false);

    // Configurar intervalo de refresh automático
    const interval = setInterval(() => {
      refreshTransactions(false);
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [currentEmpresa?.id, refreshTransactions]);

  return { refreshTransactions };
};