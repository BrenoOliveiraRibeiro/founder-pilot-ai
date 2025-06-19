
import { FinancialMetrics, InsightInsert } from "./types";

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const generateRunwayInsights = (
  empresaId: string, 
  { runwayMeses, caixaAtual, burnRate }: FinancialMetrics
): InsightInsert[] => {
  const insights: InsightInsert[] = [];

  // Só gerar insights de runway se temos dados válidos
  if (runwayMeses > 0 && caixaAtual > 0 && burnRate > 0) {
    if (runwayMeses < 1) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "🚨 Runway Crítico",
        descricao: `Seu runway é de apenas ${runwayMeses.toFixed(1)} meses com ${formatCurrency(caixaAtual)} em caixa. É urgente reduzir despesas ou buscar novas fontes de receita.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (runwayMeses < 3) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "⚠️ Runway de Atenção",
        descricao: `Seu runway é de ${runwayMeses.toFixed(1)} meses com ${formatCurrency(caixaAtual)} em caixa. Monitore de perto o fluxo de caixa e planeje ações preventivas.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (runwayMeses < 6) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "📊 Runway Moderado",
        descricao: `Seu runway é de ${runwayMeses.toFixed(1)} meses com ${formatCurrency(caixaAtual)} em caixa. Considere otimizar custos para estender sua autonomia financeira.`,
        prioridade: "media",
        status: "pendente"
      });
    } else if (runwayMeses >= 6) {
      insights.push({
        empresa_id: empresaId,
        tipo: "sugestão",
        titulo: "✅ Runway Saudável",
        descricao: `Excelente! Seu runway é de ${runwayMeses.toFixed(1)} meses com ${formatCurrency(caixaAtual)} em caixa. Este é um bom momento para investir em crescimento.`,
        prioridade: "baixa",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateBurnRateInsights = (
  empresaId: string,
  { burnRate, receitaMensal, caixaAtual }: FinancialMetrics
): InsightInsert[] => {
  const insights: InsightInsert[] = [];

  if (burnRate > 0 && receitaMensal >= 0) {
    const burnMultiple = receitaMensal > 0 ? burnRate / receitaMensal : 0;
    
    if (burnRate > receitaMensal * 2) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "🔥 Burn Rate Muito Elevado",
        descricao: `Seu burn rate de ${formatCurrency(burnRate)}/mês está muito acima da receita mensal de ${formatCurrency(receitaMensal)}. Revise urgentemente os custos operacionais.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (burnRate > receitaMensal && receitaMensal > 0) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "📈 Burn Rate Elevado",
        descricao: `Seu burn rate de ${formatCurrency(burnRate)}/mês supera a receita mensal de ${formatCurrency(receitaMensal)}. Monitore de perto os gastos.`,
        prioridade: "media",
        status: "pendente"
      });
    } else if (burnMultiple > 0 && burnMultiple < 0.8) {
      insights.push({
        empresa_id: empresaId,
        tipo: "sugestão",
        titulo: "💰 Burn Rate Controlado",
        descricao: `Ótimo controle! Seu burn rate de ${formatCurrency(burnRate)}/mês está bem equilibrado com a receita de ${formatCurrency(receitaMensal)}.`,
        prioridade: "baixa",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateCashInsights = (
  empresaId: string,
  { caixaAtual, burnRate }: FinancialMetrics
): InsightInsert[] => {
  const insights: InsightInsert[] = [];

  if (caixaAtual >= 0) {
    if (caixaAtual < 5000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "💸 Caixa Muito Baixo",
        descricao: `Seu caixa atual é de apenas ${formatCurrency(caixaAtual)}. Atenção urgente necessária para o fluxo de caixa.`,
        prioridade: "alta",
        status: "pendente"
      });
    } else if (caixaAtual < 20000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "💵 Caixa Baixo",
        descricao: `Seu caixa atual é de ${formatCurrency(caixaAtual)}. Monitore de perto as próximas movimentações financeiras.`,
        prioridade: "media",
        status: "pendente"
      });
    } else if (caixaAtual >= 50000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "sugestão",
        titulo: "🏦 Caixa Saudável",
        descricao: `Excelente posição de caixa com ${formatCurrency(caixaAtual)}. Considere oportunidades de investimento para crescimento.`,
        prioridade: "baixa",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateGrowthInsights = (
  empresaId: string,
  metricas: any
): InsightInsert[] => {
  const insights: InsightInsert[] = [];

  if (metricas && metricas.mrr_growth) {
    const crescimento = Number(metricas.mrr_growth) * 100;
    if (crescimento > 10) {
      insights.push({
        empresa_id: empresaId,
        tipo: "sugestão",
        titulo: "📈 Crescimento Positivo",
        descricao: `Sua receita cresceu ${crescimento.toFixed(1)}% no último período. Este é um bom momento para investir em escalabilidade.`,
        prioridade: "baixa",
        status: "pendente"
      });
    } else if (crescimento < -5) {
      insights.push({
        empresa_id: empresaId,
        tipo: "alerta",
        titulo: "📉 Queda na Receita",
        descricao: `Sua receita caiu ${Math.abs(crescimento).toFixed(1)}% no último período. Analise os motivos e desenvolva estratégias de recuperação.`,
        prioridade: "alta",
        status: "pendente"
      });
    }
  }

  return insights;
};

export const generateDefaultInsight = (empresaId: string): InsightInsert[] => {
  return [{
    empresa_id: empresaId,
    tipo: "sugestão",
    titulo: "🔗 Conecte seus Dados Financeiros",
    descricao: "Para gerar insights personalizados baseados na sua situação real, conecte suas contas bancárias através do Open Finance ou adicione transações manualmente.",
    prioridade: "media",
    status: "pendente"
  }];
};
