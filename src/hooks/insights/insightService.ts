
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
import { InsightInsert } from "./types";

export const fetchInsightsFromDB = async (empresaId: string): Promise<Insight[]> => {
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .eq("empresa_id", empresaId)
    .order("prioridade", { ascending: true })
    .order("data_criacao", { ascending: false })
    .limit(8); // Aumentar limite para mostrar mais insights

  if (error) throw error;
  return data as Insight[];
};

const hasMinimumDataForInsights = (transacoes: any[], metricas: any): boolean => {
  // Verificar se temos dados mínimos para gerar insights úteis
  const hasTransactions = transacoes && transacoes.length >= 3;
  const hasMetrics = metricas && (metricas.caixa_atual > 0 || metricas.receita_mensal > 0);
  
  console.log("Verificação de dados mínimos:", {
    hasTransactions,
    hasMetrics,
    transactionsCount: transacoes?.length || 0
  });

  return hasTransactions || hasMetrics;
};

const insertDemoDataIfNeeded = async (empresaId: string): Promise<boolean> => {
  try {
    console.log("Inserindo dados demo para empresa:", empresaId);
    
    const { error } = await supabase.rpc('insert_demo_data', {
      p_empresa_id: empresaId
    });

    if (error) {
      console.error("Erro ao inserir dados demo:", error);
      return false;
    }

    console.log("Dados demo inseridos com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao inserir dados demo:", error);
    return false;
  }
};

export const generateAndSaveInsights = async (empresaId: string): Promise<void> => {
  try {
    console.log("Iniciando geração de insights para empresa:", empresaId);

    // Buscar métricas mais recentes
    const { data: metricas, error: metricasError } = await supabase
      .from("metricas")
      .select("*")
      .eq("empresa_id", empresaId)
      .order("data_referencia", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (metricasError && metricasError.code !== 'PGRST116') {
      throw metricasError;
    }

    // Buscar transações dos últimos 6 meses
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: transacoes, error: transacoesError } = await supabase
      .from("transacoes")
      .select("*")
      .eq("empresa_id", empresaId)
      .gte("data_transacao", sixMonthsAgo.toISOString().split('T')[0])
      .order("data_transacao", { ascending: false });

    if (transacoesError) {
      throw transacoesError;
    }

    console.log("Dados carregados:", {
      metricas: !!metricas,
      transacoesCount: transacoes?.length || 0
    });

    // Verificar se temos dados suficientes
    if (!hasMinimumDataForInsights(transacoes || [], metricas)) {
      console.log("Dados insuficientes, tentando inserir dados demo...");
      
      // Tentar inserir dados demo
      const demoInserted = await insertDemoDataIfNeeded(empresaId);
      
      if (demoInserted) {
        // Recarregar dados após inserir demo
        const { data: newMetricas } = await supabase
          .from("metricas")
          .select("*")
          .eq("empresa_id", empresaId)
          .order("data_referencia", { ascending: false })
          .limit(1)
          .maybeSingle();

        const { data: newTransacoes } = await supabase
          .from("transacoes")
          .select("*")
          .eq("empresa_id", empresaId)
          .gte("data_transacao", sixMonthsAgo.toISOString().split('T')[0])
          .order("data_transacao", { ascending: false });

        // Usar os novos dados
        const newMetrics = calculateFinancialMetrics(newTransacoes || [], newMetricas);
        await saveGeneratedInsights(empresaId, newMetrics, newMetricas);
        return;
      }
    }

    // Limpar insights antigos antes de gerar novos
    await supabase
      .from("insights")
      .delete()
      .eq("empresa_id", empresaId);

    // Calcular métricas financeiras
    const metrics = calculateFinancialMetrics(transacoes || [], metricas);
    
    await saveGeneratedInsights(empresaId, metrics, metricas);
    
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    
    // Em caso de erro, pelo menos inserir o insight padrão
    try {
      await supabase
        .from("insights")
        .delete()
        .eq("empresa_id", empresaId);
        
      const defaultInsight = generateDefaultInsight(empresaId);
      await supabase
        .from("insights")
        .insert(defaultInsight);
    } catch (fallbackError) {
      console.error("Erro ao inserir insight padrão:", fallbackError);
    }
  }
};

const saveGeneratedInsights = async (empresaId: string, metrics: any, metricas: any) => {
  // Gerar insights baseados nas métricas
  const newInsights: InsightInsert[] = [
    ...generateRunwayInsights(empresaId, metrics),
    ...generateBurnRateInsights(empresaId, metrics),
    ...generateCashInsights(empresaId, metrics),
    ...generateGrowthInsights(empresaId, metricas)
  ];

  console.log("Insights gerados:", newInsights.length);

  // Se não há insights específicos, gerar o padrão
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
      throw insertError;
    } else {
      console.log(`${newInsights.length} insights salvos com sucesso`);
    }
  }
};
