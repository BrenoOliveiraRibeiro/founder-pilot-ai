
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

interface FinanceMetrics {
  caixaAtual: number;
  receitaMensal: number;
  despesaMensal: number;
  runwayMeses: number;
  cashFlow: number;
  burnRate: number;
}

interface FinanceMetricsGridProps {
  metrics?: FinanceMetrics | null;
}

export const FinanceMetricsGrid: React.FC<FinanceMetricsGridProps> = ({ metrics }) => {
  // Valores padrão caso não existam métricas
  const defaultMetrics = {
    caixaAtual: 420000,
    receitaMensal: 160000,
    despesaMensal: 125000,
    runwayMeses: 4.2,
    cashFlow: 35000,
    burnRate: 125000
  };

  const currentMetrics = metrics || defaultMetrics;
  
  // Calcular variação percentual (simulada)
  const receitaGrowth = 12.5;
  const despesaGrowth = 13.6;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(currentMetrics.caixaAtual)}</div>
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
            <div className="text-2xl font-bold">{formatCurrency(currentMetrics.receitaMensal)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-green-500 font-medium">+{receitaGrowth}%</span>
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
            <div className="text-2xl font-bold">{formatCurrency(currentMetrics.despesaMensal)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-red-500 font-medium">+{despesaGrowth}%</span>
            <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
