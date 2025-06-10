
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Insight } from "@/integrations/supabase/models";
import { useToast } from "@/components/ui/use-toast";
import { formatBelvoError } from "@/lib/utils";

export const useInsights = (empresaId: string | undefined) => {
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
    }
  }, [empresaId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("prioridade", { ascending: true })
        .order("data_criacao", { ascending: false })
        .limit(5);

      if (error) throw error;
      setInsights(data as Insight[]);
    } catch (error) {
      console.error("Erro ao buscar insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncMarketData = async () => {
    if (!empresaId) return;
    
    setSyncingData(true);
    try {
      // Buscar dados da empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", empresaId)
        .single();
        
      if (empresaError) throw empresaError;
      
      // Chamar a função de dados de mercado
      const { error } = await supabase.functions.invoke("market-data", {
        body: {
          action: "fetch_benchmarks",
          empresa_id: empresaId,
          setor: empresaData.segmento,
          estagio: empresaData.estagio
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Dados de mercado atualizados",
        description: "Insights e benchmarks foram atualizados com sucesso.",
      });
      
      // Atualizar os insights
      fetchInsights();
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
      console.log("Iniciando teste de conexão com Belvo...");
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "test_connection",
          sandbox: true
        }
      });
      
      if (error) {
        throw new Error(`Erro ao chamar função: ${error.message}`);
      }
      
      console.log("Resposta do teste:", data);
      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "Conexão com Belvo estabelecida",
          description: `Teste bem-sucedido: ${data.accountsCount} contas de teste encontradas.`,
        });
      } else {
        setError(formatBelvoError(data));
        toast({
          title: "Falha na conexão com Belvo",
          description: formatBelvoError(data),
          variant: "destructive"
        });
      }
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
    testBelvoConnection
  };
};
