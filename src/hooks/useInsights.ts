
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
      generateRealTimeInsights();
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

  const generateRealTimeInsights = async () => {
    if (!empresaId) return;

    try {
      // Buscar dados financeiros reais da empresa
      const { data: metricas, error: metricasError } = await supabase
        .from("metricas")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_referencia", { ascending: false })
        .limit(1)
        .single();

      if (metricasError && metricasError.code !== 'PGRST116') {
        throw metricasError;
      }

      // Buscar transações recentes
      const { data: transacoes, error: transacoesError } = await supabase
        .from("transacoes")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_transacao", { ascending: false })
        .limit(30);

      if (transacoesError) {
        throw transacoesError;
      }

      // Limpar insights antigos antes de gerar novos
      await supabase
        .from("insights")
        .delete()
        .eq("empresa_id", empresaId);

      const newInsights = [];

      if (metricas) {
        // Insight 1: Runway crítico
        if (metricas.runway_meses && metricas.runway_meses < 3) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Runway Crítico",
            descricao: `Seu runway é de apenas ${metricas.runway_meses.toFixed(1)} meses. É recomendado reduzir despesas ou buscar novas fontes de receita urgentemente.`,
            prioridade: "alta",
            status: "pendente"
          });
        } else if (metricas.runway_meses && metricas.runway_meses < 6) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Runway de Atenção",
            descricao: `Seu runway é de ${metricas.runway_meses.toFixed(1)} meses. Monitore de perto o fluxo de caixa e planeje ações preventivas.`,
            prioridade: "media",
            status: "pendente"
          });
        }

        // Insight 2: Burn rate vs receita
        if (metricas.burn_rate && metricas.receita_mensal) {
          const burnRateNumber = Number(metricas.burn_rate);
          const receitaNumber = Number(metricas.receita_mensal);
          
          if (burnRateNumber > receitaNumber * 1.2) {
            newInsights.push({
              empresa_id: empresaId,
              tipo: "alerta",
              titulo: "Burn Rate Elevado",
              descricao: `Seu burn rate (R$ ${burnRateNumber.toLocaleString('pt-BR')}) está significativamente acima da receita mensal (R$ ${receitaNumber.toLocaleString('pt-BR')}). Revise os custos operacionais.`,
              prioridade: "alta",
              status: "pendente"
            });
          }
        }

        // Insight 3: Crescimento de receita
        if (metricas.mrr_growth && metricas.mrr_growth > 0.1) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "sugestão",
            titulo: "Crescimento Positivo",
            descricao: `Sua receita cresceu ${(Number(metricas.mrr_growth) * 100).toFixed(1)}% no último período. Este é um bom momento para investir em escalabilidade.`,
            prioridade: "baixa",
            status: "pendente"
          });
        }

        // Insight 4: Caixa atual
        if (metricas.caixa_atual) {
          const caixaNumber = Number(metricas.caixa_atual);
          if (caixaNumber < 10000) {
            newInsights.push({
              empresa_id: empresaId,
              tipo: "alerta",
              titulo: "Caixa Baixo",
              descricao: `Seu caixa atual é de R$ ${caixaNumber.toLocaleString('pt-BR')}. Monitore de perto as próximas movimentações financeiras.`,
              prioridade: "media",
              status: "pendente"
            });
          }
        }
      }

      // Análise de transações recentes
      if (transacoes && transacoes.length > 0) {
        const totalReceitas = transacoes
          .filter(t => t.tipo === 'receita')
          .reduce((sum, t) => sum + Number(t.valor), 0);
        
        const totalDespesas = transacoes
          .filter(t => t.tipo === 'despesa')
          .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);

        if (totalDespesas > totalReceitas && transacoes.length >= 10) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Fluxo de Caixa Negativo",
            descricao: `Nas últimas transações, as despesas (R$ ${totalDespesas.toLocaleString('pt-BR')}) superaram as receitas (R$ ${totalReceitas.toLocaleString('pt-BR')}).`,
            prioridade: "alta",
            status: "pendente"
          });
        }

        // Verificar transações recorrentes
        const transacoesRecorrentes = transacoes.filter(t => t.recorrente);
        if (transacoesRecorrentes.length > 0) {
          const custoRecorrente = transacoesRecorrentes
            .filter(t => t.tipo === 'despesa')
            .reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
          
          if (custoRecorrente > 0) {
            newInsights.push({
              empresa_id: empresaId,
              tipo: "sugestão",
              titulo: "Despesas Recorrentes",
              descricao: `Você tem R$ ${custoRecorrente.toLocaleString('pt-BR')} em despesas recorrentes mensais. Revise periodicamente para otimização.`,
              prioridade: "baixa",
              status: "pendente"
            });
          }
        }
      }

      // Se não há dados suficientes, gerar insights básicos
      if (newInsights.length === 0) {
        newInsights.push({
          empresa_id: empresaId,
          tipo: "sugestão",
          titulo: "Conecte seus Dados Financeiros",
          descricao: "Para gerar insights personalizados, conecte suas contas bancárias através do Open Finance ou adicione transações manualmente.",
          prioridade: "media",
          status: "pendente"
        });
      }

      // Inserir novos insights
      if (newInsights.length > 0) {
        const { error: insertError } = await supabase
          .from("insights")
          .insert(newInsights);

        if (insertError) {
          console.error("Erro ao inserir insights:", insertError);
        } else {
          console.log(`${newInsights.length} insights gerados com base nos dados reais`);
          // Recarregar insights após inserção
          fetchInsights();
        }
      }
    } catch (error) {
      console.error("Erro ao gerar insights:", error);
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
    testBelvoConnection,
    generateRealTimeInsights
  };
};
