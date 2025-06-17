
import { supabase } from '@/integrations/supabase/client';

export interface OpenFinanceMetrics {
  saldoTotal: number;
  burnRate: number;
  runwayMeses: number;
  integracoesAtivas: number;
  receitaMensal: number;
  despesaMensal: number;
  transacoesRecentes: number;
  lastUpdate?: string;
}

export class OpenFinanceService {
  static async getMetrics(empresaId: string): Promise<OpenFinanceMetrics> {
    try {
      // Buscar métricas mais recentes
      const { data: metricas, error: metricasError } = await supabase
        .from('metricas')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('data_referencia', { ascending: false })
        .limit(1)
        .single();

      // Buscar integrações ativas
      const { data: integracoes, error: integracoesError } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('status', 'ativo');

      // Buscar transações recentes (últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', empresaId)
        .gte('data_transacao', thirtyDaysAgo.toISOString().split('T')[0]);

      if (metricasError && metricasError.code !== 'PGRST116') {
        console.error('Erro ao buscar métricas:', metricasError);
      }

      if (integracoesError) {
        console.error('Erro ao buscar integrações:', integracoesError);
      }

      if (transacoesError) {
        console.error('Erro ao buscar transações:', transacoesError);
      }

      // Calcular métricas baseadas nos dados disponíveis
      const integracoesAtivas = integracoes?.length || 0;
      const transacoesRecentes = transacoes?.length || 0;
      
      // Se temos métricas salvas, usar elas
      if (metricas) {
        return {
          saldoTotal: metricas.caixa_atual || 0,
          burnRate: metricas.burn_rate || 0,
          runwayMeses: metricas.runway_meses || 0,
          integracoesAtivas,
          receitaMensal: metricas.receita_mensal || 0,
          despesaMensal: Math.abs(metricas.burn_rate || 0),
          transacoesRecentes,
          lastUpdate: metricas.updated_at
        };
      }

      // Se não temos métricas, calcular básicas das transações
      const receitas = transacoes?.filter(t => t.tipo === 'receita') || [];
      const despesas = transacoes?.filter(t => t.tipo === 'despesa') || [];
      
      const receitaMensal = receitas.reduce((total, t) => total + Math.abs(t.valor), 0);
      const despesaMensal = despesas.reduce((total, t) => total + Math.abs(t.valor), 0);
      const burnRate = despesaMensal;

      // Saldo total das integrações (se disponível)
      let saldoTotal = 0;
      if (integracoes) {
        for (const integracao of integracoes) {
          if (integracao.account_data?.results) {
            saldoTotal += integracao.account_data.results.reduce((sum: number, account: any) => {
              return sum + (account.balance || 0);
            }, 0);
          }
        }
      }

      const runwayMeses = burnRate > 0 ? saldoTotal / burnRate : 0;

      return {
        saldoTotal,
        burnRate,
        runwayMeses,
        integracoesAtivas,
        receitaMensal,
        despesaMensal,
        transacoesRecentes
      };

    } catch (error) {
      console.error('Erro no OpenFinanceService.getMetrics:', error);
      throw new Error('Falha ao buscar métricas financeiras');
    }
  }

  static async syncData(empresaId: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('background-jobs', {
        body: {
          jobType: 'sync_transactions',
          empresaId,
          priority: 'high',
          payload: { sandbox: true }
        }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao sincronizar dados');
      }

      return {
        success: true,
        message: 'Dados sincronizados com sucesso'
      };

    } catch (error: any) {
      console.error('Erro ao sincronizar dados:', error);
      return {
        success: false,
        message: error.message || 'Erro ao sincronizar dados'
      };
    }
  }
}
