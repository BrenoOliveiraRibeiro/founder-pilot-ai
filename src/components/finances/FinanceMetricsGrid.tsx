
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { usePluggyFinanceData } from "@/hooks/usePluggyFinanceData";

export const FinanceMetricsGrid: React.FC = () => {
  const { metrics, getCurrentDateInfo } = usePluggyFinanceData();
  const { now } = getCurrentDateInfo();

  // Calcular variação percentual (simulada para demonstração)
  const entradasVariacao = metrics.entradasMesAtual > 0 ? 12.5 : 0;
  const saidasVariacao = metrics.saidasMesAtual > 0 ? 13.6 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(metrics.saldoTotal)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Atualizado em {format(now, "dd/MM/yyyy 'às' HH:mm")}
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
            <div className="text-2xl font-bold">{formatCurrency(metrics.entradasMesAtual)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-green-500 font-medium">+{entradasVariacao}%</span>
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
            <div className="text-2xl font-bold">{formatCurrency(metrics.saidasMesAtual)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-red-500 font-medium">+{saidasVariacao}%</span>
            <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
