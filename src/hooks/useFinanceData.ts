import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fromMetricas, fromTransacoes, fromInsights } from '@/integrations/supabase/typedClient';
import { Metrica, Transacao, Insight } from '@/integrations/supabase/models';

// Hook para buscar dados financeiros do usuário logado
export const useFinanceData = (empresaId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrica | null>(null);
  const [transactions, setTransactions] = useState<Transacao[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [cashRunway, setCashRunway] = useState<any[]>([]);
  const [isRunwayCritical, setIsRunwayCritical] = useState(false);

  useEffect(() => {
    if (!empresaId) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar as métricas mais recentes
        const { data: metricData, error: metricError } = await fromMetricas()
          .select('*')
          .eq('empresa_id', empresaId)
          .order('data_referencia', { ascending: false })
          .limit(1)
          .single();

        if (metricError) throw metricError;
        setMetrics(metricData as Metrica);
        
        // Verificar se o runway está em estado crítico (menos de 3 meses)
        if (metricData?.runway_meses !== null && metricData?.runway_meses < 3) {
          setIsRunwayCritical(true);
        } else {
          setIsRunwayCritical(false);
        }

        // Buscar as transações recentes
        const { data: transactionData, error: transactionError } = await fromTransacoes()
          .select('*')
          .eq('empresa_id', empresaId)
          .order('data_transacao', { ascending: false })
          .limit(5);

        if (transactionError) throw transactionError;
        setTransactions(transactionData as Transacao[]);

        // Buscar os insights
        const { data: insightData, error: insightError } = await fromInsights()
          .select('*')
          .eq('empresa_id', empresaId)
          .order('data_criacao', { ascending: false })
          .limit(4);

        if (insightError) throw insightError;
        setInsights(insightData as Insight[]);

        // Dados para o gráfico de runway
        // Normalmente seriam calculados dinamicamente, mas usaremos dados fictícios por enquanto
        const runwayData = [
          { month: "Jul", balance: 162700 },
          { month: "Ago", balance: 150000 },
          { month: "Set", balance: 137300 },
          { month: "Out", balance: 124500 },
          { month: "Nov", balance: 111800, future: true },
          { month: "Dez", balance: 99100, future: true },
          { month: "Jan", balance: 86400, future: true },
          { month: "Fev", balance: 73700, future: true },
          { month: "Mar", balance: 61000, future: true },
          { month: "Abr", balance: 48300, future: true },
          { month: "Mai", balance: 35600, future: true },
          { month: "Jun", balance: 22900, future: true },
          { month: "Jul", balance: 10200, future: true },
          { month: "Ago", balance: -2500, future: true },
        ];
        setCashRunway(runwayData);

      } catch (err: any) {
        console.error('Erro ao buscar dados financeiros:', err);
        setError('Falha ao carregar os dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empresaId]);

  return { loading, error, metrics, transactions, insights, cashRunway, isRunwayCritical };
};
