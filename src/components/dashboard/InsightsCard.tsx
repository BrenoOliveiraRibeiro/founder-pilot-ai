
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  BarChart2, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface InsightItemProps {
  icon: React.ReactNode;
  title: string;
  status: "success" | "warning" | "danger" | "info";
  index: number;
}

const InsightItem = ({ icon, title, status, index }: InsightItemProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "danger":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
      className={`p-3 rounded-md border ${getStatusClasses()} flex items-center gap-3`}
    >
      {icon}
      <p className="text-sm font-medium">{title}</p>
    </motion.div>
  );
};

export const InsightsCard = () => {
  const { currentEmpresa } = useAuth();
  const { loading: financeLoading, insights: dbInsights } = useFinanceData(currentEmpresa?.id || null);
  const { 
    saldoCaixa, 
    entradasMesAtual, 
    saidasMesAtual, 
    fluxoCaixaMesAtual,
    loading: transactionsLoading 
  } = useTransactionsMetrics();
  const { metrics: openFinanceMetrics, loading: openFinanceLoading } = useOpenFinanceDashboard();

  const loading = financeLoading || transactionsLoading || openFinanceLoading;

  // Função para gerar insights baseados em dados reais
  const generateRealTimeInsights = () => {
    const insights = [];
    
    // Usar dados do Open Finance se disponíveis, senão usar dados de transações
    const hasOpenFinanceData = openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0;
    const saldo = hasOpenFinanceData ? openFinanceMetrics.saldoTotal : saldoCaixa;
    const receita = hasOpenFinanceData ? openFinanceMetrics.receitaMensal : entradasMesAtual;
    const despesas = hasOpenFinanceData ? openFinanceMetrics.despesasMensais : saidasMesAtual;
    const fluxo = hasOpenFinanceData ? openFinanceMetrics.fluxoCaixa : fluxoCaixaMesAtual;
    const runway = hasOpenFinanceData ? openFinanceMetrics.runwayMeses : 0;
    const burnRate = hasOpenFinanceData ? openFinanceMetrics.burnRate : despesas;

    // Insight 1: Análise de Runway
    if (runway > 0) {
      if (runway < 3) {
        insights.push({
          id: "runway-critico",
          tipo: "alerta",
          titulo: `Runway crítico: apenas ${runway.toFixed(1)} meses restantes`,
          prioridade: "alta"
        });
      } else if (runway < 6) {
        insights.push({
          id: "runway-atencao",
          tipo: "alerta",
          titulo: `Runway de ${runway.toFixed(1)} meses - considere estratégias de captação`,
          prioridade: "media"
        });
      } else {
        insights.push({
          id: "runway-saudavel",
          tipo: "sugestão",
          titulo: `Runway saudável de ${runway.toFixed(1)} meses - bom momento para crescimento`,
          prioridade: "baixa"
        });
      }
    }

    // Insight 2: Análise de Fluxo de Caixa
    if (fluxo < 0) {
      const percentualNegativo = Math.abs((fluxo / receita) * 100);
      insights.push({
        id: "fluxo-negativo",
        tipo: "alerta",
        titulo: `Fluxo de caixa negativo: ${percentualNegativo.toFixed(0)}% da receita`,
        prioridade: percentualNegativo > 50 ? "alta" : "media"
      });
    } else if (fluxo > 0) {
      const percentualPositivo = (fluxo / receita) * 100;
      insights.push({
        id: "fluxo-positivo",
        tipo: "sugestão",
        titulo: `Fluxo de caixa positivo: ${percentualPositivo.toFixed(0)}% da receita`,
        prioridade: "baixa"
      });
    }

    // Insight 3: Análise de Burn Rate vs Receita
    if (receita > 0 && burnRate > 0) {
      const razaoBurnReceita = burnRate / receita;
      if (razaoBurnReceita > 1.5) {
        insights.push({
          id: "burn-alto",
          tipo: "alerta",
          titulo: "Burn rate muito alto comparado à receita - otimize custos",
          prioridade: "alta"
        });
      } else if (razaoBurnReceita > 1.2) {
        insights.push({
          id: "burn-atencao",
          tipo: "alerta",
          titulo: "Burn rate elevado - monitore gastos de perto",
          prioridade: "media"
        });
      }
    }

    // Insight 4: Análise de Saldo
    if (saldo < 0) {
      insights.push({
        id: "saldo-negativo",
        tipo: "alerta",
        titulo: "Saldo negativo - ação imediata necessária",
        prioridade: "alta"
      });
    } else if (saldo < burnRate) {
      insights.push({
        id: "saldo-baixo",
        tipo: "alerta",
        titulo: "Saldo inferior ao burn rate mensal - risco de liquidez",
        prioridade: "alta"
      });
    }

    // Insight 5: Análise de eficiência operacional
    if (receita > 0 && despesas > 0) {
      const eficiencia = (receita - despesas) / receita;
      if (eficiencia > 0.2) {
        insights.push({
          id: "eficiencia-boa",
          tipo: "sugestão",
          titulo: `Boa eficiência operacional: ${(eficiencia * 100).toFixed(0)}% de margem`,
          prioridade: "baixa"
        });
      } else if (eficiencia < 0) {
        insights.push({
          id: "eficiencia-ruim",
          tipo: "alerta",
          titulo: "Despesas superam receitas - revise estrutura de custos",
          prioridade: "alta"
        });
      }
    }

    // Se não há dados suficientes, usar insights do banco de dados
    if (insights.length === 0 && dbInsights.length > 0) {
      return dbInsights.slice(0, 4);
    }

    // Se ainda não há insights, retornar insights de exemplo baseados em dados conectados
    if (insights.length === 0) {
      return hasOpenFinanceData ? [
        {
          id: "dados-conectados",
          tipo: "sugestão",
          titulo: "Dados bancários conectados - análises em tempo real disponíveis",
          prioridade: "baixa"
        },
        {
          id: "monitoramento-ativo",
          tipo: "sugestão",
          titulo: "Monitoramento ativo das transações está funcionando",
          prioridade: "baixa"
        }
      ] : [
        {
          id: "conectar-dados",
          tipo: "alerta",
          titulo: "Conecte suas contas bancárias para insights baseados em dados reais",
          prioridade: "media"
        },
        {
          id: "analise-manual",
          tipo: "sugestão",
          titulo: "Adicione transações manualmente para começar a análise",
          prioridade: "baixa"
        }
      ];
    }

    return insights.slice(0, 4); // Limitar a 4 insights
  };

  // Mapeamento de prioridade para status visual
  const getStatusFromPriority = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "danger";
      case "media": return "warning";
      case "baixa": return "success";
      default: return "info";
    }
  };

  // Mapeamento de tipo para ícone
  const getIconFromType = (tipo: string) => {
    switch (tipo) {
      case "alerta": return <AlertTriangle className="h-4 w-4" />;
      case "sugestão": return <CheckCircle className="h-4 w-4" />;
      case "projeção":
        return Math.random() > 0.5 ? 
          <TrendingUp className="h-4 w-4" /> : 
          <TrendingDown className="h-4 w-4" />;
      default: return <BarChart2 className="h-4 w-4" />;
    }
  };

  const insightsToDisplay = generateRealTimeInsights();

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <Card>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Insights Gerados por IA
          </CardTitle>
        </CardHeader>
      </motion.div>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-14">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
              </Skeleton>
            ))}
          </div>
        ) : (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {insightsToDisplay.map((insight, index) => (
              <InsightItem
                key={insight.id}
                index={index}
                icon={getIconFromType(insight.tipo)}
                title={insight.titulo}
                status={getStatusFromPriority(insight.prioridade)}
              />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
