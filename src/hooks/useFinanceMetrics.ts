
import { useState, useEffect } from 'react';
import { fromMetricas } from '@/integrations/supabase/typedClient';
import { Metrica } from '@/integrations/supabase/models';

export const useFinanceMetrics = (empresaId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metrica | null>(null);
  const [isRunwayCritical, setIsRunwayCritical] = useState(false);
  const [cashRunway, setCashRunway] = useState<any[]>([]);

  useEffect(() => {
    if (!empresaId) return;

    const fetchMetrics = async () => {
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
        console.error('Erro ao buscar métricas financeiras:', err);
        setError('Falha ao carregar métricas. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [empresaId]);

  return { 
    loading, 
    error, 
    metrics, 
    isRunwayCritical, 
    cashRunway 
  };
};
