
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface RealtimeUpdateOptions {
  onTransactionUpdate?: () => void;
  onMetricsUpdate?: () => void;
  onIntegrationUpdate?: () => void;
  onInsightUpdate?: () => void;
}

export const useRealtimeUpdates = (options: RealtimeUpdateOptions = {}) => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const showUpdateNotification = useCallback((type: string) => {
    toast({
      title: "Dados atualizados",
      description: `Novos ${type} foram sincronizados automaticamente.`,
      duration: 3000,
    });
  }, [toast]);

  useEffect(() => {
    if (!currentEmpresa?.id) return;

    // Canal para atualizações de transações
    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transacoes',
          filter: `empresa_id=eq.${currentEmpresa.id}`
        },
        (payload) => {
          console.log('Transação atualizada em tempo real:', payload);
          if (payload.eventType === 'INSERT') {
            showUpdateNotification('transações');
          }
          options.onTransactionUpdate?.();
        }
      )
      .subscribe();

    // Canal para atualizações de métricas
    const metricsChannel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'metricas',
          filter: `empresa_id=eq.${currentEmpresa.id}`
        },
        (payload) => {
          console.log('Métricas atualizadas em tempo real:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            showUpdateNotification('métricas');
          }
          options.onMetricsUpdate?.();
        }
      )
      .subscribe();

    // Canal para atualizações de integrações bancárias
    const integrationsChannel = supabase
      .channel('integrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'integracoes_bancarias',
          filter: `empresa_id=eq.${currentEmpresa.id}`
        },
        (payload) => {
          console.log('Integração bancária atualizada em tempo real:', payload);
          options.onIntegrationUpdate?.();
        }
      )
      .subscribe();

    // Canal para atualizações de insights
    const insightsChannel = supabase
      .channel('insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'insights',
          filter: `empresa_id=eq.${currentEmpresa.id}`
        },
        (payload) => {
          console.log('Insight atualizado em tempo real:', payload);
          if (payload.eventType === 'INSERT') {
            showUpdateNotification('insights');
          }
          options.onInsightUpdate?.();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(integrationsChannel);
      supabase.removeChannel(insightsChannel);
    };
  }, [currentEmpresa?.id, options, showUpdateNotification]);
};
