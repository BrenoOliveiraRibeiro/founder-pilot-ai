
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Insight } from "@/integrations/supabase/models";
import { Button } from "@/components/ui/button";
import { Lightbulb, BarChart2, AlertTriangle, TrendingUp, TestTube } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export const AIAdvisorEngine = () => {
  const { currentEmpresa } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingData, setSyncingData] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchInsights();
    }
  }, [currentEmpresa]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("empresa_id", currentEmpresa?.id)
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
    if (!currentEmpresa?.id) return;
    
    setSyncingData(true);
    try {
      // Buscar dados da empresa
      const { data: empresaData, error: empresaError } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", currentEmpresa.id)
        .single();
        
      if (empresaError) throw empresaError;
      
      // Chamar a função de dados de mercado
      const { error } = await supabase.functions.invoke("market-data", {
        body: {
          action: "fetch_benchmarks",
          empresa_id: currentEmpresa.id,
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
    if (!currentEmpresa?.id) return;
    
    setTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "test_connection",
          empresa_id: currentEmpresa.id
        }
      });
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Conexão com Belvo estabelecida",
          description: `Teste bem-sucedido: ${data.accountsCount} contas de teste encontradas.`,
        });
      } else {
        toast({
          title: "Falha na conexão com Belvo",
          description: data.message || "Erro ao conectar com a API do Belvo.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao testar conexão Belvo:", error);
      toast({
        title: "Erro ao testar conexão",
        description: "Ocorreu um erro ao testar a conexão com a API do Belvo.",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const getIconForInsight = (tipo: string) => {
    switch (tipo) {
      case "alerta":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "projeção":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "border-destructive/20 bg-destructive/5";
      case "media":
        return "border-warning/20 bg-warning/5";
      case "baixa":
        return "border-success/20 bg-success/5";
      default:
        return "border-primary/20 bg-primary/5";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Motor de Análise IA</h3>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={testBelvoConnection}
            disabled={testingConnection || !currentEmpresa?.id}
          >
            {testingConnection ? "Testando..." : "Testar Belvo"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={syncMarketData}
            disabled={syncingData || !currentEmpresa?.id}
          >
            {syncingData ? "Analisando..." : "Analisar Dados de Mercado"}
          </Button>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-24" />
          ))}
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className={`p-4 rounded-md border ${getPriorityColor(insight.prioridade)}`}
            >
              <div className="flex items-start gap-3">
                {getIconForInsight(insight.tipo)}
                <div>
                  <h4 className="font-medium text-sm mb-1">{insight.titulo}</h4>
                  <p className="text-xs text-muted-foreground">{insight.descricao}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p>Sem insights disponíveis.</p>
          <p className="text-sm">Conecte dados bancários ou analise dados de mercado para gerar insights.</p>
        </div>
      )}
    </div>
  );
};
