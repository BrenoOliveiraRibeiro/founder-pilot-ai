
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PluggyFinanceData {
  caixaAtual: number;
  receitaMensal: number;
  despesasMensal: number;
  runway: number;
  cashFlow: number;
  burnRate: number;
  mrrGrowth: number;
  entradaMes: number;
  saidaMes: number;
  variacao_entrada: number;
  variacao_saida: number;
}

export const usePluggyFinanceData = (empresaId: string | null) => {
  const [data, setData] = useState<PluggyFinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    const fetchFinanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar métricas mais recentes
        const { data: metricas, error: metricasError } = await supabase
          .from('metricas')
          .select('*')
          .eq('empresa_id', empresaId)
          .order('data_referencia', { ascending: false })
          .limit(2);

        if (metricasError) {
          throw metricasError;
        }

        // Buscar transações do mês atual
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const { data: transacoes, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', empresaId)
          .gte('data_transacao', firstDayOfMonth.toISOString().split('T')[0])
          .lte('data_transacao', lastDayOfMonth.toISOString().split('T')[0]);

        if (transacoesError) {
          throw transacoesError;
        }

        // Processar dados
        const metricaAtual = metricas?.[0];
        const metricaAnterior = metricas?.[1];

        // Calcular entradas e saídas do mês
        const entradas = transacoes?.filter(t => t.tipo === 'receita') || [];
        const saidas = transacoes?.filter(t => t.tipo === 'despesa') || [];

        const entradaMes = entradas.reduce((total, t) => total + Number(t.valor), 0);
        const saidaMes = Math.abs(saidas.reduce((total, t) => total + Number(t.valor), 0));

        // Calcular variações (simplificado)
        const variacao_entrada = metricaAnterior ? 
          ((Number(metricaAtual?.receita_mensal || 0) - Number(metricaAnterior.receita_mensal || 0)) / Number(metricaAnterior.receita_mensal || 1)) * 100 
          : 12.5;

        const variacao_saida = metricaAnterior ? 
          ((Number(metricaAtual?.burn_rate || 0) - Number(metricaAnterior.burn_rate || 0)) / Number(metricaAnterior.burn_rate || 1)) * 100 
          : 13.6;

        const financeData: PluggyFinanceData = {
          caixaAtual: Number(metricaAtual?.caixa_atual || 0),
          receitaMensal: Number(metricaAtual?.receita_mensal || 0),
          despesasMensal: Number(metricaAtual?.burn_rate || 0),
          runway: Number(metricaAtual?.runway_meses || 0),
          cashFlow: Number(metricaAtual?.cash_flow || 0),
          burnRate: Number(metricaAtual?.burn_rate || 0),
          mrrGrowth: Number(metricaAtual?.mrr_growth || 0),
          entradaMes,
          saidaMes,
          variacao_entrada,
          variacao_saida
        };

        setData(financeData);
      } catch (err) {
        console.error('Erro ao buscar dados financeiros:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchFinanceData();
  }, [empresaId]);

  return { data, loading, error };
};
