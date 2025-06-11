
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";

export const FinanceMetricsGrid: React.FC = () => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);

  // Usar métricas mais recentes ou valores padrão
  const latestMetrics = metrics[0] || {
    caixa_atual: 0,
    receita_mensal: 0,
    burn_rate: 0,
    cash_flow: 0
  };

  const getCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { current: firstDay, previous: lastMonth };
  };

  const calculateGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // Simular dados do mês anterior para cálculo de crescimento
  // Em uma implementação real, isso viria do banco de dados
  const previousMonthRevenue = latestMetrics.receita_mensal * 0.9; // Simulação
  const previousMonthExpenses = latestMetrics.burn_rate * 0.95; // Simulação

  const revenueGrowth = calculateGrowthPercentage(latestMetrics.receita_mensal, previousMonthRevenue);
  const expensesGrowth = calculateGrowthPercentage(latestMetrics.burn_rate, previousMonthExpenses);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(latestMetrics.caixa_atual)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Entradas (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(latestMetrics.receita_mensal)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium ${revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {revenueGrowth >= 0 ? '+' : ''}{revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saídas (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(latestMetrics.burn_rate)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium ${expensesGrowth >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {expensesGrowth >= 0 ? '+' : ''}{expensesGrowth.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
