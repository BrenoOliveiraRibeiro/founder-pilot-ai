import React from "react";
import { MetricCard } from "./MetricCard";
import { 
  AlertTriangle,
  BanknoteIcon, 
  CalendarClock, 
  CreditCard, 
  DollarSign, 
  TrendingDown, 
  Wallet,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { formatCurrency } from "@/lib/utils";

export const OpenFinanceMetricsGrid = () => {
  const { metrics, loading, error, hasOpenFinanceData } = useOpenFinanceDashboard();

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

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar dados</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  const getRunwayColor = (runway: number) => {
    if (runway < 3) return "border-destructive bg-destructive/5";
    if (runway < 6) return "border-warning/20 bg-warning/5";
    return "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-900/10";
  };

  return (
    <>
      {metrics.alertaCritico && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Alerta de Runway Crítico!</AlertTitle>
            <AlertDescription>
              Seu runway atual é de apenas {metrics.runwayMeses.toFixed(1)} meses baseado nos dados conectados. 
              Recomendamos tomar ações imediatas para reduzir despesas ou buscar captação de recursos.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {!hasOpenFinanceData && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Alert className="mb-4">
            <Zap className="h-4 w-4" />
            <AlertTitle>Conecte suas contas bancárias</AlertTitle>
            <AlertDescription>
              Para ver métricas dinâmicas e precisas, conecte suas contas bancárias via Open Finance.
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
            title="Saldo Total"
            value={formatCurrency(metrics.saldoTotal)}
            description={`${metrics.integracoesAtivas} contas conectadas`}
            icon={<DollarSign className="h-5 w-5 text-primary" />}
            tooltip="Saldo total em todas as contas bancárias conectadas via Open Finance"
            loading={loading}
            className="border-primary/20 bg-primary/5"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Receita Mensal"
            value={formatCurrency(metrics.receitaMensal)}
            description="mês atual"
            icon={<BanknoteIcon className="h-5 w-5 text-blue-500" />}
            tooltip="Receita total do mês atual baseada em transações conectadas"
            loading={loading}
            className="border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Despesas Mensais"
            value={formatCurrency(metrics.despesasMensais)}
            description="mês atual"
            icon={<CreditCard className="h-5 w-5 text-red-500" />}
            tooltip="Despesas totais do mês atual baseadas em transações conectadas"
            loading={loading}
            className="border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Runway Atual"
            value={`${metrics.runwayMeses.toFixed(1)} meses`}
            description="baseado em dados conectados"
            icon={<CalendarClock className="h-5 w-5 text-warning" />}
            tooltip="Tempo que seu dinheiro durará na taxa atual de gastos, calculado com dados das contas conectadas"
            className={getRunwayColor(metrics.runwayMeses)}
            loading={loading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Fluxo de Caixa"
            value={formatCurrency(metrics.fluxoCaixa)}
            description="mês atual"
            icon={<Wallet className="h-5 w-5 text-amber-500" />}
            tooltip="Fluxo de caixa líquido (receita menos despesas) do mês atual"
            loading={loading}
            className="border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10"
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <MetricCard
            title="Burn Rate"
            value={formatCurrency(metrics.burnRate)}
            description="média mensal"
            icon={<TrendingDown className="h-5 w-5 text-destructive" />}
            tooltip="Taxa média de gastos mensais baseada nos últimos 3 meses"
            className="border-destructive/20 bg-destructive/5"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {metrics.ultimaAtualizacao && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xs text-muted-foreground mb-4 flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Última sincronização: {new Date(metrics.ultimaAtualizacao).toLocaleString('pt-BR')}
        </motion.div>
      )}
    </>
  );
};
