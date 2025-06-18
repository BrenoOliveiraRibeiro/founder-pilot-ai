
import { Insight } from "@/integrations/supabase/models";
import { FinancialMetrics } from "./types";

export const generateRunwayInsights = (
  empresaId: string, 
  { runwayMeses }: FinancialMetrics
): Partial<Insight>[] => {
  const insights: Partial<Insight>[] = [];

  if (runwayMeses > 0) {
    if (runwayMeses < 1) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Runway Crítico",
        descricao: `Seu runway é de apenas ${runwayMeses.toFixed(1)} meses. É urgente reduzir despesas ou buscar novas fontes de receita.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (runwayMeses < 3) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Runway de Atenção",
        descricao: `Seu runway é de ${runwayMeses.toFixed(1)} meses. Monitore de perto o fluxo de caixa e planeje ações preventivas.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (runwayMeses < 6) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Runway Moderado",
        descricao: `Seu runway é de ${runwayMeses.toFixed(1)} meses. Considere otimizar custos para estender sua autonomia financeira.`,
        prioridade: "media",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateBurnRateInsights = (
  empresaId: string,
  { burnRate, receitaMensal }: FinancialMetrics
): Partial<Insight>[] => {
  const insights: Partial<Insight>[] = [];

  if (burnRate > 0 && receitaMensal > 0) {
    if (burnRate > receitaMensal * 1.5) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Burn Rate Muito Elevado",
        descricao: `Seu burn rate (R$ ${burnRate.toFixed(0)}) está muito acima da receita mensal (R$ ${receitaMensal.toFixed(0)}). Revise urgentemente os custos operacionais.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (burnRate > receitaMensal) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Burn Rate Elevado",
        descricao: `Seu burn rate (R$ ${burnRate.toFixed(0)}) supera a receita mensal (R$ ${receitaMensal.toFixed(0)}). Monitore de perto os gastos.`,
        prioridade: "media",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateCashInsights = (
  empresaId: string,
  { caixaAtual }: FinancialMetrics
): Partial<Insight>[] => {
  const insights: Partial<Insight>[] = [];

  if (caixaAtual > 0) {
    if (caixaAtual < 1000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Caixa Muito Baixo",
        descricao: `Seu caixa atual é de apenas R$ ${caixaAtual.toFixed(0)}. Atenção urgente necessária para o fluxo de caixa.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (caixaAtual < 5000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "Caixa Baixo",
        descricao: `Seu caixa atual é de R$ ${caixaAtual.toFixed(0)}. Monitore de perto as próximas movimentações financeiras.`,
        prioridade: "media",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateGrowthInsights = (
  empresaId: string,
  metricas: any
): Partial<Insight>[] => {
  const insights: Partial<Insight>[] = [];

  if (metricas && metricas.mrr_growth && Number(metricas.mrr_growth) > 0) {
    const crescimento = Number(metricas.mrr_growth) * 100;
    if (crescimento > 10) {
      insights.push({
        empresa_id: empresaId,
        tipo: "sugestão",
        titulo: "Crescimento Positivo",
        descricao: `Sua receita cresceu ${crescimento.toFixed(1)}% no último período. Este é um bom momento para investir em escalabilidade.`,
        prioridade: "baixa",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateDefaultInsight = (empresaId: string): Partial<Insight>[] => {
  return [{
    empresa_id: empresaId,
    tipo: "sugestão",
    titulo: "Conecte seus Dados Financeiros",
    descricao: "Para gerar insights personalizados, conecte suas contas bancárias através do Open Finance ou adicione transações manualmente.",
    prioridade: "media",
    status: "pendente"
  }];
};
