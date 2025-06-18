
import { supabase } from "@/integrations/supabase/client";
import { Insight } from "@/integrations/supabase/models";
import { calculateFinancialMetrics } from "./financialCalculations";
import { 
  generateRunwayInsights, 
  generateBurnRateInsights, 
  generateCashInsights, 
  generateGrowthInsights, 
  generateDefaultInsight 
} from "./insightGenerators";

export const fetchInsightsFromDB = async (empresaId: string): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("prioridade", { ascending: true })
    .order("data_criacao", { ascending: false })
    .limit(5);

  if (error) throw error;
  return data as Insight[];
};

export const generateAndSaveInsights = async (empresaId: string): Promise<void> => {
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

  // Buscar transações recentes dos últimos 3 meses
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

  // Limpar insights antigos
  await supabase
    .from("insights")
    .delete()
    .eq("empresa_id", empresaId);

  // Calcular métricas financeiras
  const metrics = calculateFinancialMetrics(transacoes || [], metricas);
  
  console.log("Métricas calculadas:", { 
    caixaAtual: metrics.caixaAtual, 
    receitaMensal: metrics.receitaMensal.toFixed(0), 
    burnRate: metrics.burnRate.toFixed(0), 
    runwayMeses: metrics.runwayMeses.toFixed(1) 
  });

  // Gerar insights baseados nas métricas
  const newInsights = [
    ...generateRunwayInsights(empresaId, metrics),
    ...generateBurnRateInsights(empresaId, metrics),
    ...generateCashInsights(empresaId, metrics),
    ...generateGrowthInsights(empresaId, metricas)
  ];

  // Se não há insights, gerar o padrão
  if (newInsights.length === 0) {
    newInsights.push(...generateDefaultInsight(empresaId));
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
    }
  }
};
