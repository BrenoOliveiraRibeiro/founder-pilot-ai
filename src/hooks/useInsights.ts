
import { useState, useEffect } from "react";
import { Insight } from "@/integrations/supabase/models";
import { useToast } from "@/components/ui/use-toast";
import { UseInsightsReturn } from "./insights/types";
import { fetchInsightsFromDB, generateAndSaveInsights } from "./insights/insightService";
import { syncMarketDataService } from "./insights/marketDataService";
import { testBelvoConnectionService } from "./insights/belvoService";

export const useInsights = (empresaId: string | undefined): UseInsightsReturn => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingData, setSyncingData] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (empresaId) {
      fetchInsights();
      generateRealTimeInsights();
    }
  }, [empresaId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const data = await fetchInsightsFromDB(empresaId!);
      setInsights(data);
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateRealTimeInsights = async () => {
    if (!empresaId) return;

    try {
      await generateAndSaveInsights(empresaId);
      // Recarregar insights após inserção
      fetchInsights();
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
    }
  };

  const syncMarketData = async () => {
    if (!empresaId) return;
    
    setSyncingData(true);
    try {
      await syncMarketDataService(empresaId, toast);
      // Atualizar os insights
      await generateRealTimeInsights();
    } catch (error) {
      console.error("Erro ao sincronizar dados de mercado:", error);
      toast({
        title: "Erro ao sincronizar dados",
        description: "Não foi possível atualizar os dados de mercado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSyncingData(false);
    }
  };

  const testBelvoConnection = async () => {
    if (!empresaId) return;
    
    setTestingConnection(true);
    setError(null);
    setTestResult(null);
    
    try {
      const data = await testBelvoConnectionService(toast);
      setTestResult(data);
    } catch (error: any) {
      console.error("Erro ao testar conexão Belvo:", error);
      setError(error.message);
      toast({
        title: "Erro ao testar conexão",
        description: `Ocorreu um erro ao testar a conexão com a API do Belvo: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return {
    insights,
    loading,
    syncingData,
    testingConnection,
    testResult,
    error,
    fetchInsights,
    syncMarketData,
    testBelvoConnection,
    generateRealTimeInsights
  };
};
