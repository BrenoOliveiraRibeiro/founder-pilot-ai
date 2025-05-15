
import { useState, useEffect } from 'react';
import { fromInsights } from '@/integrations/supabase/typedClient';
import { Insight } from '@/integrations/supabase/models';

export const useFinanceInsights = (empresaId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    if (!empresaId) return;

    const fetchInsights = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar os insights
        const { data: insightData, error: insightError } = await fromInsights()
          .select('*')
          .eq('empresa_id', empresaId)
          .order('data_criacao', { ascending: false })
          .limit(4);

        if (insightError) throw insightError;
        setInsights(insightData as Insight[]);

      } catch (err: any) {
        console.error('Erro ao buscar insights:', err);
        setError('Falha ao carregar insights. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [empresaId]);

  return { 
    loading, 
    error, 
    insights 
  };
};
