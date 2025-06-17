
import { useState, useCallback } from 'react';

export const useMarketAnalysisState = () => {
  const [segment, setSegment] = useState('');
  const [region, setRegion] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [aiEnriched, setAiEnriched] = useState(false);
  const [rawAiData, setRawAiData] = useState<string | null>(null);
  const [tamSamSomData, setTamSamSomData] = useState<any[]>([]);
  const [competitorsData, setCompetitorsData] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [growthProjection, setGrowthProjection] = useState<string>('');
  const [entryBarriers, setEntryBarriers] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('overview');

  const setAnalysisData = useCallback((data: any) => {
    const { tam, sam, som, competitors, insights: marketInsights, growth_projection, entry_barriers } = data;
    
    // Formatar dados para o gráfico de TAM/SAM/SOM
    const chartData = [
      { name: 'TAM', value: tam.value, color: '#0ea5e9', description: tam.description },
      { name: 'SAM', value: sam.value, color: '#14b8a6', description: sam.description },
      { name: 'SOM', value: som.value, color: '#8b5cf6', description: som.description }
    ];
    
    setTamSamSomData(chartData);
    setCompetitorsData(competitors);
    setInsights(marketInsights);
    setGrowthProjection(growth_projection || '28%');
    setEntryBarriers(entry_barriers || []);
    setHasAnalysis(true);
  }, []);

  const resetAnalysis = useCallback(() => {
    setHasAnalysis(false);
    setTamSamSomData([]);
    setCompetitorsData([]);
    setInsights([]);
    setGrowthProjection('');
    setEntryBarriers([]);
    setRawAiData(null);
    setAiEnriched(false);
    setCurrentTab('overview');
  }, []);

  return {
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
  };
};
