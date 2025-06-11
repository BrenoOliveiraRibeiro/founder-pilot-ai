
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { usePluggyFinanceData } from "@/hooks/usePluggyFinanceData";

export const FinanceOverviewTab: React.FC<{ runway: number }> = ({ runway }) => {
  const { metrics } = usePluggyFinanceData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Runway</CardTitle>
          <CardDescription>
            Com base no burn rate atual, seu dinheiro dura:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className={`text-5xl font-bold mb-2 ${runway < 3 ? 'text-red-500' : runway < 6 ? 'text-warning' : 'text-green-500'}`}>
              {runway.toFixed(1)} meses
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Burn rate mensal médio: {formatCurrency(metrics.burnRate)}
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${runway < 3 ? 'bg-red-500' : runway < 6 ? 'bg-warning' : 'bg-green-500'}`}
                style={{ width: `${Math.min(runway / 12 * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              Meta recomendada: 12+ meses
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saúde Financeira</CardTitle>
          <CardDescription>Indicadores de saúde financeira da empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                title: "Cash Flow", 
                value: formatCurrency(metrics.cashFlow), 
                status: metrics.cashFlow > 0 ? "good" : "warning", 
                target: ">R$ 0" 
              },
              { 
                title: "Burn Rate", 
                value: formatCurrency(metrics.burnRate), 
                status: metrics.burnRate < metrics.saldoTotal * 0.1 ? "good" : "warning", 
                target: "<10% do caixa" 
              },
              { 
                title: "Runway", 
                value: `${runway.toFixed(1)} meses`, 
                status: runway > 6 ? "good" : runway > 3 ? "warning" : "critical", 
                target: ">6 meses" 
              },
              { 
                title: "Receita Mensal", 
                value: formatCurrency(metrics.entradasMesAtual), 
                status: metrics.entradasMesAtual > metrics.saidasMesAtual ? "good" : "warning", 
                target: ">Despesas" 
              }
            ].map((metric, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  metric.status === 'good' ? 'bg-green-500' : 
                  metric.status === 'warning' ? 'bg-warning' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.title}</span>
                    <span className="font-bold">{metric.value}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Meta: {metric.target}</span>
                    <span>{
                      metric.status === 'good' ? 'Bom' : 
                      metric.status === 'warning' ? 'Atenção' : 'Crítico'
                    }</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
