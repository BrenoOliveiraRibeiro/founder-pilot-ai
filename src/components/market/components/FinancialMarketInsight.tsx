
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { AlertCircle, Calculator, LineChart, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialMarketInsightProps {
  tamValue: number;
  samValue: number;
  somValue: number;
  segment: string;
}

export const FinancialMarketInsight: React.FC<FinancialMarketInsightProps> = ({
  tamValue,
  samValue,
  somValue,
  segment
}) => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);
  
  // Cálculos de insights financeiros relacionados ao mercado
  const cashToSomRatio = metrics?.caixa_atual && somValue ? (metrics.caixa_atual / somValue) * 100 : 0;
  const monthsToCaptureSom = metrics?.burn_rate && metrics?.receita_mensal && somValue 
    ? (somValue / ((metrics.receita_mensal || 0) * 12)) * 12 
    : 0;
  const runwayToMarketRatio = metrics?.runway_meses && monthsToCaptureSom 
    ? (metrics.runway_meses / monthsToCaptureSom) * 100 
    : 0;
  
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          Insights Financeiros para Captura de Mercado
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>
        ) : !metrics?.caixa_atual ? (
          <div className="flex items-center gap-2 text-sm text-warning">
            <AlertCircle className="h-4 w-4" />
            <p>Conecte seus dados financeiros via Open Finance para obter insights personalizados</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-md bg-background p-3 border">
                <h4 className="text-xs text-muted-foreground mb-1">Caixa vs. SOM</h4>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{cashToSomRatio.toFixed(1)}%</p>
                  <div className="text-xs text-right">
                    <p>{formatCurrency(metrics.caixa_atual)} / {formatCurrency(somValue)}</p>
                    <p className="text-muted-foreground">
                      {cashToSomRatio < 1 ? "Captação necessária" : "Caixa suficiente"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="rounded-md bg-background p-3 border">
                <h4 className="text-xs text-muted-foreground mb-1">Runway vs. Tempo de Captura</h4>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{runwayToMarketRatio.toFixed(1)}%</p>
                  <div className="text-xs text-right">
                    <p>{metrics.runway_meses?.toFixed(1)} / {monthsToCaptureSom.toFixed(1)} meses</p>
                    <p className="text-muted-foreground">
                      {runwayToMarketRatio < 100 ? "Runway insuficiente" : "Runway adequado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-sm space-y-1">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                <p>
                  {cashToSomRatio < 10 
                    ? `Seu caixa atual representa apenas ${cashToSomRatio.toFixed(1)}% do seu SOM. Considere captar pelo menos ${formatCurrency(somValue * 0.2)} para ter recursos suficientes para execução.`
                    : `Com ${formatCurrency(metrics.caixa_atual)} em caixa, você tem recursos para capturar ${(cashToSomRatio > 100 ? 100 : cashToSomRatio).toFixed(1)}% do seu SOM no setor de ${segment}.`
                  }
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <LineChart className="h-4 w-4 text-amber-500 mt-0.5" />
                <p>
                  {metrics.runway_meses && metrics.runway_meses < 6 
                    ? `Com runway de ${metrics.runway_meses.toFixed(1)} meses, você precisaria de capital adicional para perseguir este mercado de forma efetiva.`
                    : `Com seu burn rate atual de ${formatCurrency(metrics.burn_rate || 0)}/mês, você precisaria de aproximadamente ${monthsToCaptureSom.toFixed(1)} meses para capturar este mercado.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
