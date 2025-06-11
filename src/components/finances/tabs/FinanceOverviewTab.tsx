
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePluggyFinanceData } from "@/hooks/usePluggyFinanceData";
import { Skeleton } from "@/components/ui/skeleton";

export const FinanceOverviewTab: React.FC = () => {
  const { currentEmpresa } = useAuth();
  const { data, loading, error } = usePluggyFinanceData(currentEmpresa?.id || null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Erro ao carregar dados financeiros</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usar dados reais ou fallback
  const runway = data?.runway || 4.2;
  const burnRate = data?.burnRate || 100000;

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
              Burn rate mensal médio: {formatCurrency(burnRate)}
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
              { title: "Margem Bruta", value: "54%", status: "good", target: ">50%" },
              { title: "Margem Líquida", value: "15%", status: "warning", target: ">20%" },
              { title: "Eficiência de Capital", value: "1.8x", status: "good", target: ">1.5x" },
              { title: "Burn Multiple", value: "2.1x", status: "warning", target: "<1.5x" }
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
                    <span>{metric.status === 'good' ? 'Bom' : metric.status === 'warning' ? 'Atenção' : 'Crítico'}</span>
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
