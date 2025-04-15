import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fromEmpresas } from "@/integrations/supabase/typedClient";

export const useMarketAnalysis = () => {
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
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  
  const { toast } = useToast();

  // Buscar dados da empresa ao carregar o componente
  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: empresas, error } = await fromEmpresas()
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Erro ao buscar dados da empresa:", error);
            return;
          }
          
          if (empresas) {
            setEmpresaData(empresas);
            
            // Preencher campos com dados da empresa
            if (empresas.segmento) setSegment(empresas.segmento);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    
    fetchEmpresaData();
  }, []);

  const handleAnalyze = async () => {
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
        const { data: empresas } = await fromEmpresas()
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (empresas) {
          empresa_id = empresas.id;
        }
      }
      
      // Chamada para Edge Function
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
        setIsLoading(false);
        return;
      }
      
      if (result && result.data) {
        const { tam, sam, som, competitors, insights: marketInsights, growth_projection, entry_barriers } = result.data;
        
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
        setAiEnriched(result.ai_enriched || false);
        setRawAiData(result.raw_ai_data || null);
        
        setHasAnalysis(true);
        toast({
          title: "Análise concluída",
          description: "Dados de mercado analisados com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao processar análise:", error);
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro ao processar os dados de mercado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setHasAnalysis(false);
    setTamSamSomData([]);
    setCompetitorsData([]);
    setInsights([]);
    setGrowthProjection('');
    setEntryBarriers([]);
    setRawAiData(null);
    setAiEnriched(false);
    setCurrentTab('overview');
  };

  return {
    segment,
    setSegment,
    region,
    setRegion,
    customerType,
    setCustomerType,
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
    currentTab,
    setCurrentTab,
    handleAnalyze,
    resetAnalysis
  };
};
