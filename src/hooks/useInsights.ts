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

      // Buscar transações recentes dos últimos 3 meses para cálculos mais precisos
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const { data: transacoes, error: transacoesError } = await supabase
        .from("transacoes")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("data_transacao", threeMonthsAgo.toISOString().split('T')[0])
        .order("data_transacao", { ascending: false });

      if (transacoesError) {
        throw transacoesError;
      }

      // Limpar insights antigos antes de gerar novos
      await supabase
        .from("insights")
        .delete()
        .eq("empresa_id", empresaId);

      const newInsights = [];

      // Calcular métricas corretas baseadas nas transações reais
      let caixaAtual = 0;
      let receitaMensal = 0;
      let burnRate = 0;
      let runwayMeses = 0;

      if (transacoes && transacoes.length > 0) {
        // Separar receitas e despesas
        const receitas = transacoes.filter(t => t.tipo === 'receita' && t.valor > 0);
        const despesas = transacoes.filter(t => t.tipo === 'despesa' && t.valor < 0);

        // Calcular receita mensal (média dos últimos 3 meses)
        const totalReceitas = receitas.reduce((sum, t) => sum + Number(t.valor), 0);
        receitaMensal = totalReceitas / 3;

        // Calcular burn rate (média das despesas dos últimos 3 meses)
        const totalDespesas = despesas.reduce((sum, t) => sum + Math.abs(Number(t.valor)), 0);
        burnRate = totalDespesas / 3;

        // Usar caixa atual das métricas se disponível, senão calcular saldo
        if (metricas && metricas.caixa_atual) {
          caixaAtual = Number(metricas.caixa_atual);
        } else {
          // Calcular saldo baseado em todas as transações
          caixaAtual = transacoes.reduce((saldo, t) => saldo + Number(t.valor), 0);
          // Se ainda for negativo ou muito baixo, usar um valor mínimo
          if (caixaAtual < 0) caixaAtual = Math.abs(caixaAtual);
        }

        // Calcular runway (em meses)
        runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;

        console.log("Métricas calculadas:", { 
          caixaAtual, 
          receitaMensal: receitaMensal.toFixed(0), 
          burnRate: burnRate.toFixed(0), 
          runwayMeses: runwayMeses.toFixed(1) 
        });
      } else if (metricas) {
        // Usar dados das métricas se não há transações
        caixaAtual = Number(metricas.caixa_atual) || 0;
        receitaMensal = Number(metricas.receita_mensal) || 0;
        burnRate = Number(metricas.burn_rate) || 0;
        runwayMeses = Number(metricas.runway_meses) || 0;
      }

      // Gerar insights baseados nos valores reais calculados
      if (runwayMeses > 0) {
        if (runwayMeses < 1) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Runway Crítico",
            descricao: `Seu runway é de apenas ${runwayMeses.toFixed(1)} meses. É urgente reduzir despesas ou buscar novas fontes de receita.`,
            prioridade: "alta",
            status: "pendente"
          });
        } else if (runwayMeses < 3) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Runway de Atenção",
            descricao: `Seu runway é de ${runwayMeses.toFixed(1)} meses. Monitore de perto o fluxo de caixa e planeje ações preventivas.`,
            prioridade: "alta",
            status: "pendente"
          });
        } else if (runwayMeses < 6) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "runway Moderado",
            descricao: `Seu runway é de ${runwayMeses.toFixed(1)} meses. Considere otimizar custos para estender sua autonomia financeira.`,
            prioridade: "media",
            status: "pendente"
          });
        }
      }

      // Insight sobre burn rate vs receita
      if (burnRate > 0 && receitaMensal > 0) {
        if (burnRate > receitaMensal * 1.5) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Burn Rate Muito Elevado",
            descricao: `Seu burn rate (R$ ${burnRate.toFixed(0)}) está muito acima da receita mensal (R$ ${receitaMensal.toFixed(0)}). Revise urgentemente os custos operacionais.`,
            prioridade: "alta",
            status: "pendente"
          });
        } else if (burnRate > receitaMensal) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Burn Rate Elevado",
            descricao: `Seu burn rate (R$ ${burnRate.toFixed(0)}) supera a receita mensal (R$ ${receitaMensal.toFixed(0)}). Monitore de perto os gastos.`,
            prioridade: "media",
            status: "pendente"
          });
        }
      }

      // Insight sobre caixa atual
      if (caixaAtual > 0) {
        if (caixaAtual < 1000) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Caixa Muito Baixo",
            descricao: `Seu caixa atual é de apenas R$ ${caixaAtual.toFixed(0)}. Atenção urgente necessária para o fluxo de caixa.`,
            prioridade: "alta",
            status: "pendente"
          });
        } else if (caixaAtual < 5000) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "alerta",
            titulo: "Caixa Baixo",
            descricao: `Seu caixa atual é de R$ ${caixaAtual.toFixed(0)}. Monitore de perto as próximas movimentações financeiras.`,
            prioridade: "media",
            status: "pendente"
          });
        }
      }

      // Análise de crescimento se há dados históricos
      if (metricas && metricas.mrr_growth && Number(metricas.mrr_growth) > 0) {
        const crescimento = Number(metricas.mrr_growth) * 100;
        if (crescimento > 10) {
          newInsights.push({
            empresa_id: empresaId,
            tipo: "sugestão",
            titulo: "Crescimento Positivo",
            descricao: `Sua receita cresceu ${crescimento.toFixed(1)}% no último período. Este é um bom momento para investir em escalabilidade.`,
            prioridade: "baixa",
            status: "pendente"
          });
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
