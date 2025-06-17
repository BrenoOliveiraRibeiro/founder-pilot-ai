
import React, { useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMarketDataFetcher } from '@/hooks/market/useMarketDataFetcher';
import { useEmpresaData } from '@/hooks/market/useEmpresaData';
import { useMarketAnalysisState } from '@/hooks/market/useMarketAnalysisState';

export const useMarketAnalysis = () => {
  const { toast } = useToast();
  const { analyzeMarket } = useMarketDataFetcher();
  const { empresaData } = useEmpresaData();
  
  const {
    segment, setSegment,
    region, setRegion,
    customerType, setCustomerType,
    isLoading, setIsLoading,
    hasAnalysis,
    aiEnriched, setAiEnriched,
    rawAiData, setRawAiData,
    tamSamSomData,
    competitorsData,
    insights,
    growthProjection,
    entryBarriers,
    currentTab, setCurrentTab,
    setAnalysisData,
    resetAnalysis
  } = useMarketAnalysisState();

  // Preencher campos com dados da empresa quando disponível
  React.useEffect(() => {
    if (empresaData?.segmento) {
      setSegment(empresaData.segmento);
    }
  }, [empresaData, setSegment]);

  const handleAnalyze = useCallback(async () => {
    if (!segment) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o segmento de atuação",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Obter sessão atual para pegar o ID da empresa
      const { data: { session } } = await supabase.auth.getSession();
      let empresa_id = null;
      
      if (session?.user) {
        const { data: empresas } = await supabase
          .from('empresas')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (empresas) {
          empresa_id = empresas.id;
        }
      }
      
      const result = await analyzeMarket(segment, region, customerType, empresa_id);
      
      if (result && result.data) {
        setAnalysisData(result.data);
        setAiEnriched(result.ai_enriched || false);
        setRawAiData(result.raw_ai_data || null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [segment, region, customerType, analyzeMarket, setAnalysisData, setAiEnriched, setRawAiData, setIsLoading, toast]);

  return {
    segment, setSegment,
    region, setRegion,
    customerType, setCustomerType,
    isLoading,
    hasAnalysis,
    tamSamSomData,
    competitorsData,
    insights,
    growthProjection,
    entryBarriers,
    rawAiData,
    aiEnriched,
    empresaData,
    currentTab, setCurrentTab,
    handleAnalyze,
    resetAnalysis
  };
};
