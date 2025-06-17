
import { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMarketDataFetcher = () => {
  const { toast } = useToast();

  const analyzeMarket = useCallback(async (
    segment: string,
    region: string,
    customerType: string,
    empresa_id: string | null
  ) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'analyze_market_size',
          segment,
          region,
          customerType,
          empresa_id
        }
      });
      
      if (error) {
        console.error("Erro ao analisar mercado:", error);
        toast({
          title: "Erro na análise",
          description: "Não foi possível concluir a análise de mercado.",
          variant: "destructive"
        });
        return null;
      }
      
      if (result && result.data) {
        toast({
          title: "Análise concluída",
          description: "Dados de mercado analisados com sucesso!",
        });
        return result;
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao processar análise:", error);
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro ao processar os dados de mercado.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  return {
    analyzeMarket
  };
};
