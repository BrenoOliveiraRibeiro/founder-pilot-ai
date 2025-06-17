
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeUpdateOptions {
  onTransactionUpdate?: () => void;
  onMetricsUpdate?: () => void;
  onIntegrationUpdate?: () => void;
  onInsightUpdate?: () => void;
}

export class RealtimeService {
  private channels: RealtimeChannel[] = [];

  subscribe(empresaId: string, options: RealtimeUpdateOptions, showNotification: (type: string) => void) {
    // Limpar canais existentes
    this.unsubscribe();

    if (options.onTransactionUpdate) {
      const transactionsChannel = supabase
        .channel('transactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transacoes',
            filter: `empresa_id=eq.${empresaId}`
          },
          (payload) => {
            console.log('Transação atualizada em tempo real:', payload);
            if (payload.eventType === 'INSERT') {
              showNotification('transações');
            }
            options.onTransactionUpdate?.();
          }
        )
        .subscribe();

      this.channels.push(transactionsChannel);
    }

    if (options.onMetricsUpdate) {
      const metricsChannel = supabase
        .channel('metrics-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'metricas',
            filter: `empresa_id=eq.${empresaId}`
          },
          (payload) => {
            console.log('Métricas atualizadas em tempo real:', payload);
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              showNotification('métricas');
            }
            options.onMetricsUpdate?.();
          }
        )
        .subscribe();

      this.channels.push(metricsChannel);
    }

    if (options.onIntegrationUpdate) {
      const integrationsChannel = supabase
        .channel('integrations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'integracoes_bancarias',
            filter: `empresa_id=eq.${empresaId}`
          },
          (payload) => {
            console.log('Integração bancária atualizada em tempo real:', payload);
            options.onIntegrationUpdate?.();
          }
        )
        .subscribe();

      this.channels.push(integrationsChannel);
    }

    if (options.onInsightUpdate) {
      const insightsChannel = supabase
        .channel('insights-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'insights',
            filter: `empresa_id=eq.${empresaId}`
          },
          (payload) => {
            console.log('Insight atualizado em tempo real:', payload);
            if (payload.eventType === 'INSERT') {
              showNotification('insights');
            }
            options.onInsightUpdate?.();
          }
        )
        .subscribe();

      this.channels.push(insightsChannel);
    }
  }

  unsubscribe() {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels = [];
  }
}
