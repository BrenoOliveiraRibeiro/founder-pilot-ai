
import React from "react";
import { MetricCard } from "./MetricCard";
import { 
  AlertTriangle,
  BanknoteIcon, 
  CalendarClock, 
  CreditCard, 
  DollarSign, 
  LineChart, 
  TrendingDown, 
  Wallet 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";

export const MetricsGrid = () => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading: financeLoading, isRunwayCritical } = useFinanceData(currentEmpresa?.id || null);
  const { 
    saldoCaixa, 
    entradasMesAtual, 
    saidasMesAtual, 
    fluxoCaixaMesAtual,
    loading: transactionsLoading 
  } = useTransactionsMetrics();

  const loading = financeLoading || transactionsLoading;

  // Só usar dados reais se existirem transações conectadas
  const hasRealData = saldoCaixa > 0 || entradasMesAtual > 0 || saidasMesAtual > 0;
  
  // Se não há dados reais, mostrar zeros
  const cashBalance = hasRealData ? saldoCaixa : 0;
  const monthlyRevenue = hasRealData ? entradasMesAtual : 0;
  const monthlyBurn = hasRealData ? saidasMesAtual : 0;
  const runway = hasRealData ? (metrics?.runway_meses || 0) : 0;
  const mrrGrowth = hasRealData ? (metrics?.mrr_growth || 0) : 0;
  const burnRate = hasRealData ? (monthlyBurn / 4) : 0;
  const cashFlow = hasRealData ? fluxoCaixaMesAtual : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        duration: 0.5
      }
    }
  };

  // Se não há dados reais, mostrar alerta para conectar contas
  if (!hasRealData) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Conecte suas contas bancárias</AlertTitle>
            <AlertDescription>
              Para visualizar suas métricas financeiras, conecte suas contas bancárias via Open Finance na seção de Finanças.
            </AlertDescription>
          </Alert>
        </motion.div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8"
        >
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Saldo em Caixa"
              value="R$ 0"
              description="Conecte suas contas para ver dados reais"
              icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas bancárias para ver o saldo real"
              loading={loading}
              className="border-muted bg-muted/5"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Receita Mensal"
              value="R$ 0"
              description="Aguardando dados"
              icon={<BanknoteIcon className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas para ver a receita real"
              loading={loading}
              className="border-muted bg-muted/5"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Gastos Mensais"
              value="R$ 0"
              description="Aguardando dados"
              icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas para ver os gastos reais"
              loading={loading}
              className="border-muted bg-muted/5"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Runway"
              value="0 meses"
              description="Aguardando dados"
              icon={<CalendarClock className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas para calcular o runway"
              className="border-muted bg-muted/5"
              loading={loading}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Crescimento MRR"
              value="0%"
              description="Aguardando dados"
              icon={<LineChart className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas para ver o crescimento"
              className="border-muted bg-muted/5"
              loading={loading}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Taxa de Queima"
              value="R$ 0"
              description="Aguardando dados"
              icon={<TrendingDown className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas para ver a taxa de queima"
              className="border-muted bg-muted/5"
              loading={loading}
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <MetricCard
              title="Fluxo de Caixa"
              value="R$ 0"
              description="Aguardando dados"
              icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
              tooltip="Conecte suas contas para ver o fluxo de caixa"
              loading={loading}
              className="border-muted bg-muted/5"
            />
          </motion.div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {isRunwayCritical && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Alerta de Runway Crítico!</AlertTitle>
            <AlertDescription>
              Seu runway atual é de apenas {runway.toFixed(1)} meses. Recomendamos tomar ações imediatas para 
              reduzir despesas ou buscar captação de recursos.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8"
      >
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Saldo em Caixa"
            value={`R$${cashBalance.toLocaleString('pt-BR')}`}
            description="Baseado em transações conectadas"
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            tooltip="Seu saldo total em caixa baseado nas transações das contas conectadas"
            loading={loading}
            className="border-primary/20 bg-primary/5"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Receita Mensal"
            value={`R$${monthlyRevenue.toLocaleString('pt-BR')}`}
            description="mês atual"
            icon={<BanknoteIcon className="h-5 w-5 text-blue-500" />}
            tooltip="Sua receita total para o mês atual baseada nas transações"
            loading={loading}
            className="border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Gastos Mensais"
            value={`R$${monthlyBurn.toLocaleString('pt-BR')}`}
            description="mês atual"
            icon={<CreditCard className="h-5 w-5 text-red-500" />}
            tooltip="Suas despesas totais para o mês atual baseadas nas transações"
            loading={loading}
            className="border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Runway"
            value={`${runway.toLocaleString('pt-BR')} meses`}
            description="na taxa atual de queima"
            icon={<CalendarClock className="h-5 w-5 text-warning" />}
            tooltip="Quanto tempo seu caixa durará na taxa atual de queima"
            className={isRunwayCritical 
              ? "border-destructive bg-destructive/5" 
              : (runway < 6 
                ? "border-warning/20 bg-warning/5"
                : "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
              )}
            loading={loading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Crescimento MRR"
            value={`${mrrGrowth}%`}
            description="vs. mês anterior"
            icon={<LineChart className="h-5 w-5 text-green-500" />}
            tooltip="Crescimento mês a mês em receita recorrente"
            className="border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10"
            loading={loading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Taxa de Queima"
            value={`R$${burnRate.toLocaleString('pt-BR')}`}
            description="média semanal"
            icon={<TrendingDown className="h-5 w-5 text-destructive" />}
            tooltip="Sua taxa média de gasto semanal"
            className="border-destructive/20 bg-destructive/5"
            loading={loading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Fluxo de Caixa"
            value={`R$${cashFlow.toLocaleString('pt-BR')}`}
            description="mês atual"
            icon={<Wallet className="h-5 w-5 text-amber-500" />}
            tooltip="Fluxo de caixa líquido (receita menos despesas) do mês atual"
            loading={loading}
            className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
          />
        </motion.div>
      </motion.div>
    </>
  );
};
