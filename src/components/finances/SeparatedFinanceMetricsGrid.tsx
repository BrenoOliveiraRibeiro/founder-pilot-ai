import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface SeparatedMetrics {
  realCashBalance: number;
  runwayMonths: number;
  receitaMensal: number;
  despesasMensais: number;
  fluxoCaixa: number;
  alertaCritico: boolean;
}

interface SeparatedFinanceMetricsGridProps {
  metrics: SeparatedMetrics;
}

export const SeparatedFinanceMetricsGrid: React.FC<SeparatedFinanceMetricsGridProps> = ({
  metrics
}) => {
  const getRunwayColor = (runway: number) => {
    if (runway < 3) return "text-destructive";
    if (runway < 6) return "text-yellow-600";
    return "text-green-600";
  };

  const getFluxoColor = (fluxo: number) => {
    if (fluxo < 0) return "text-destructive";
    return "text-green-600";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Saldo Real em Caixa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Real em Caixa
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(metrics.realCashBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Apenas contas de débito
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Runway Ajustado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Runway Real
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRunwayColor(metrics.runwayMonths)}`}>
              {metrics.runwayMonths.toFixed(1)} meses
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em dinheiro real
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Receita Mensal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Mensal
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.receitaMensal)}
            </div>
            <p className="text-xs text-muted-foreground">
              Mês atual
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fluxo de Caixa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fluxo de Caixa
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getFluxoColor(metrics.fluxoCaixa)}`}>
              {formatCurrency(metrics.fluxoCaixa)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receita - Despesas
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};