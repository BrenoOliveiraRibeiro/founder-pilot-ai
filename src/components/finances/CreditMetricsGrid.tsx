import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface CreditMetrics {
  totalCreditLimit: number;
  usedCreditLimit: number;
  availableCreditLimit: number;
  utilizationPercentage: number;
  nextDueBills: any[];
  creditAccounts: any[];
}

interface CreditMetricsGridProps {
  creditMetrics: CreditMetrics;
  isCriticalUsage: boolean;
}

export const CreditMetricsGrid: React.FC<CreditMetricsGridProps> = ({
  creditMetrics,
  isCriticalUsage
}) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage > 80) return "text-destructive";
    if (percentage > 60) return "text-yellow-600";
    return "text-green-600";
  };

  const getUtilizationBadgeVariant = (percentage: number) => {
    if (percentage > 80) return "destructive";
    if (percentage > 60) return "secondary";
    return "default";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Limite Total Disponível */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Limite Total
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(creditMetrics.totalCreditLimit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditMetrics.creditAccounts.length} cartão{creditMetrics.creditAccounts.length !== 1 ? 'ões' : ''}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Limite Disponível */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Limite Disponível
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(creditMetrics.availableCreditLimit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Disponível para uso
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Utilização de Crédito */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilização
            </CardTitle>
            {isCriticalUsage && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(creditMetrics.utilizationPercentage)}`}>
              {creditMetrics.utilizationPercentage.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getUtilizationBadgeVariant(creditMetrics.utilizationPercentage)}>
                {formatCurrency(creditMetrics.usedCreditLimit)} usado
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Próximas Faturas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Próximas Faturas
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                creditMetrics.nextDueBills.reduce((sum, bill) => sum + bill.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {creditMetrics.nextDueBills.length} fatura{creditMetrics.nextDueBills.length !== 1 ? 's' : ''} próximo mês
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerta de Uso Crítico */}
      {isCriticalUsage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="md:col-span-2 lg:col-span-4"
        >
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <h4 className="font-semibold text-destructive">Uso Alto de Crédito</h4>
                  <p className="text-sm text-muted-foreground">
                    Você está usando {creditMetrics.utilizationPercentage.toFixed(1)}% do seu limite total. 
                    Considere reduzir o uso ou quitar faturas para melhorar sua situação financeira.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};