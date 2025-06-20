
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Calendar, AlertTriangle, DollarSign, BarChart, Users, ShieldCheck, Database, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationsPanelProps {
  runwayMonths: number;
  burnRate: number;
  hasRealData?: boolean;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  runwayMonths,
  burnRate,
  hasRealData = false
}) => {
  const { currentEmpresa } = useAuth();
  const { metrics: openFinanceMetrics } = useOpenFinanceDashboard();
  const { saldoCaixa, entradasMesAtual, saidasMesAtual } = useTransactionsMetrics();

  // Buscar transações recentes para análise de padrões
  const { data: recentTransactions = [] } = useQuery({
    queryKey: ['recent-transactions-analysis', currentEmpresa?.id],
    queryFn: async () => {
      if (!currentEmpresa?.id) return [];
      
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .order('data_transacao', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentEmpresa?.id,
  });

  // Análise inteligente baseada em dados reais
  const generateAIRecommendations = () => {
    const hasOpenFinanceData = openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0;
    const currentSaldo = hasOpenFinanceData ? openFinanceMetrics.saldoTotal : saldoCaixa;
    const receita = hasOpenFinanceData ? openFinanceMetrics.receitaMensal : entradasMesAtual;
    const despesas = hasOpenFinanceData ? openFinanceMetrics.despesasMensais : saidasMesAtual;
    
    // Análise de categorias de despesas
    const despesasPorCategoria = recentTransactions
      .filter(tx => tx.tipo === 'despesa')
      .reduce((acc, tx) => {
        acc[tx.categoria] = (acc[tx.categoria] || 0) + Math.abs(tx.valor);
        return acc;
      }, {} as Record<string, number>);

    const categoriaComMaiorGasto = Object.entries(despesasPorCategoria)
      .sort(([,a], [,b]) => b - a)[0];

    // Análise de tendência de receita
    const receitasUltimos3Meses = recentTransactions
      .filter(tx => tx.tipo === 'receita')
      .slice(0, 30)
      .reduce((sum, tx) => sum + tx.valor, 0);

    const mediaReceitaMensal = receitasUltimos3Meses / 3;
    const crescimentoReceita = receita > mediaReceitaMensal;

    // Análise de recorrência de despesas
    const despesasRecorrentes = recentTransactions
      .filter(tx => tx.tipo === 'despesa' && tx.recorrente)
      .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

    const percentualDespesasRecorrentes = despesas > 0 ? (despesasRecorrentes / despesas) * 100 : 0;

    if (runwayMonths < 3) {
      // Runway crítico - recomendações específicas baseadas nos dados
      return [
        {
          icon: <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Situação crítica: Ação imediata necessária",
          description: hasRealData 
            ? `Com base na análise dos seus dados reais, você tem apenas ${runwayMonths.toFixed(1)} meses de runway. ${categoriaComMaiorGasto ? `Sua maior categoria de gasto é ${categoriaComMaiorGasto[0]} (R$ ${formatCurrency(categoriaComMaiorGasto[1])}). Corte 40% desta categoria imediatamente.` : 'Reduza despesas em 40% imediatamente.'}`
            : "Corte 30-40% das despesas não essenciais para estender seu runway por pelo menos 2 meses.",
          priority: "high",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        },
        {
          icon: <DollarSign className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Captação de emergência urgente",
          description: `Baseado no seu burn rate atual de ${formatCurrency(burnRate)}, busque captação bridge de ${formatCurrency(burnRate * 6)} para 6 meses de runway adicional. ${hasRealData && percentualDespesasRecorrentes > 70 ? `Atenção: ${percentualDespesasRecorrentes.toFixed(0)}% das suas despesas são recorrentes, dificultando cortes rápidos.` : ''}`,
          priority: "high",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        },
        {
          icon: <Users className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: hasRealData ? "Reestruturação baseada em dados reais" : "Revise estrutura da equipe",
          description: hasRealData
            ? `Análise dos seus gastos mostra: ${despesasPorCategoria['Recursos Humanos'] ? `RH representa R$ ${formatCurrency(despesasPorCategoria['Recursos Humanos'])} mensais. ` : ''}Considere reestruturação estratégica para preservar caixa crítico.`
            : "Considere reestruturação de time e possíveis reduções para preservar caixa.",
          priority: "high",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        }
      ];
    } else if (runwayMonths < 6) {
      // Runway preocupante - análises mais refinadas
      return [
        {
          icon: <TrendingDown className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Otimização inteligente de custos",
          description: hasRealData
            ? `Análise detalhada: ${categoriaComMaiorGasto ? `${categoriaComMaiorGasto[0]} é sua maior despesa (R$ ${formatCurrency(categoriaComMaiorGasto[1])}). ` : ''}${despesasPorCategoria['Marketing'] ? `Marketing: R$ ${formatCurrency(despesasPorCategoria['Marketing'])}. ` : ''}Reduza 20% nos gastos não essenciais para estender runway em 1.8 meses.`
            : "Uma redução de 15-20% nas despesas de marketing e serviços externos pode estender seu runway em 1.5 meses.",
          priority: "medium",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        },
        {
          icon: <Calendar className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Estratégia de captação baseada em performance",
          description: hasRealData && crescimentoReceita
            ? `Sua receita cresceu ${((receita / mediaReceitaMensal - 1) * 100).toFixed(0)}% vs média dos últimos 3 meses. Use essa tração para negociar melhores termos na captação nos próximos 60 dias.`
            : "Comece a preparar documentação e pitch para investidores com antecedência.",
          priority: "medium",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        },
        {
          icon: <BarChart className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Eficiência de receita",
          description: hasRealData
            ? `Receita atual: ${formatCurrency(receita)}. ${crescimentoReceita ? 'Tendência positiva detectada - ' : 'Receita estável - '}foque em clientes com maior LTV para maximizar eficiência do capital disponível.`
            : "Foque em clientes com menor CAC e maior LTV para maximizar eficiência do capital.",
          priority: "medium",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        }
      ];
    } else {
      // Runway saudável - oportunidades estratégicas
      return [
        {
          icon: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
          title: "Crescimento baseado em dados",
          description: hasRealData
            ? `Runway saudável de ${runwayMonths.toFixed(1)} meses confirmado. ${crescimentoReceita ? `Receita crescendo (+${((receita / mediaReceitaMensal - 1) * 100).toFixed(0)}%) - ` : ''}investir 25-30% em canais que demonstram ROI positivo conforme seus dados históricos.`
            : "Com runway saudável, considere reinvestir 20-30% em canais de aquisição que provaram ROI positivo.",
          priority: "low",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        },
        {
          icon: <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
          title: "Posição estratégica para captação",
          description: hasRealData && currentSaldo > burnRate * 6
            ? `Com ${formatCurrency(currentSaldo)} em caixa e burn rate controlado, você está em posição de força. Negocie melhores termos nos próximos 4-6 meses.`
            : "Aproveite a posição de força para negociar melhores termos com investidores nos próximos 3-4 meses.",
          priority: "low",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        },
        {
          icon: <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
          title: "Diversificação e resiliência",
          description: hasRealData
            ? `${percentualDespesasRecorrentes.toFixed(0)}% das despesas são recorrentes. ${receita > despesas * 1.2 ? 'Boa margem operacional - ' : ''}desenvolva múltiplas fontes de receita para aumentar resiliência financeira.`
            : "Desenvolva múltiplas fontes de receita e crie reservas para enfrentar possíveis cenários adversos.",
          priority: "low",
          dataSource: hasRealData ? "dados-reais" : "estimativa"
        }
      ];
    }
  };

  const recommendations = generateAIRecommendations();

  // Função para formatar valores monetários
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(Math.abs(value));
  }

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            FounderPilot AI
            {hasRealData && (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Conectado
              </Badge>
            )}
          </CardTitle>
          <Badge variant={runwayMonths < 3 ? "destructive" : runwayMonths < 6 ? "warning" : "default"}>
            {runwayMonths < 3 ? 'Ação Urgente' : runwayMonths < 6 ? 'Atenção' : 'Crescimento'}
          </Badge>
        </div>
        <CardDescription>
          {hasRealData 
            ? `Insights baseados na análise de ${recentTransactions.length} transações reais`
            : "Sugestões para otimizar seu runway e finanças"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border-2 transition-all ${
                recommendation.priority === "high" 
                  ? "bg-destructive/10 border-destructive/70" 
                  : recommendation.priority === "medium"
                  ? "bg-warning/10 border-warning/70"
                  : "bg-green-100/50 border-green-500/70 dark:bg-green-900/20 dark:border-green-700/50"
              }`}
            >
              <div className="flex items-start gap-2">
                {recommendation.icon}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-sm">{recommendation.title}</h3>
                    {hasRealData && (
                      <Badge variant="outline" className="text-xs">
                        <Database className="h-2 w-2 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {recommendation.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {hasRealData && recentTransactions.length > 0 && (
          <div className="mt-4 p-2 bg-muted/30 rounded-lg">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Análise baseada em {recentTransactions.length} transações • Última atualização: agora
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
