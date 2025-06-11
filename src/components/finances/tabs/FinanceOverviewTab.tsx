
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";

export const FinanceOverviewTab: React.FC<{ runway: number }> = ({ runway }) => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);

  // Usar métricas mais recentes ou valores padrão
  const latestMetrics = metrics[0] || {
    caixa_atual: 0,
    receita_mensal: 0,
    burn_rate: 100000, // Valor padrão para evitar divisão por zero
    runway_meses: 0,
    cash_flow: 0
  };

  const actualRunway = latestMetrics.runway_meses || runway;

  // Calcular métricas de saúde financeira
  const calculateMargemBruta = () => {
    if (latestMetrics.receita_mensal === 0) return 0;
    // Simulação de margem bruta (receita - custos diretos) / receita
    const custosDiretos = latestMetrics.burn_rate * 0.4; // 40% do burn rate como custos diretos
    return ((latestMetrics.receita_mensal - custosDiretos) / latestMetrics.receita_mensal) * 100;
  };

  const calculateMargemLiquida = () => {
    if (latestMetrics.receita_mensal === 0) return 0;
    return (latestMetrics.cash_flow / latestMetrics.receita_mensal) * 100;
  };

  const calculateEficienciaCapital = () => {
    if (latestMetrics.burn_rate === 0) return 0;
    return latestMetrics.receita_mensal / latestMetrics.burn_rate;
  };

  const calculateBurnMultiple = () => {
    if (latestMetrics.receita_mensal === 0) return 0;
    return latestMetrics.burn_rate / latestMetrics.receita_mensal;
  };

  const margemBruta = calculateMargemBruta();
  const margemLiquida = calculateMargemLiquida();
  const eficienciaCapital = calculateEficienciaCapital();
  const burnMultiple = calculateBurnMultiple();

  const getMetricStatus = (value: number, good: number, warning: number, isReverse = false) => {
    if (isReverse) {
      if (value <= good) return 'good';
      if (value <= warning) return 'warning';
      return 'bad';
    } else {
      if (value >= good) return 'good';
      if (value >= warning) return 'warning';
      return 'bad';
    }
  };

  const healthMetrics = [
    { 
      title: "Margem Bruta", 
      value: `${margemBruta.toFixed(1)}%`, 
      status: getMetricStatus(margemBruta, 50, 30), 
      target: ">50%" 
    },
    { 
      title: "Margem Líquida", 
      value: `${margemLiquida.toFixed(1)}%`, 
      status: getMetricStatus(margemLiquida, 20, 10), 
      target: ">20%" 
    },
    { 
      title: "Eficiência de Capital", 
      value: `${eficienciaCapital.toFixed(1)}x`, 
      status: getMetricStatus(eficienciaCapital, 1.5, 1.0), 
      target: ">1.5x" 
    },
    { 
      title: "Burn Multiple", 
      value: `${burnMultiple.toFixed(1)}x`, 
      status: getMetricStatus(burnMultiple, 1.5, 2.0, true), 
      target: "<1.5x" 
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
            <div className={`text-5xl font-bold mb-2 ${actualRunway < 3 ? 'text-red-500' : actualRunway < 6 ? 'text-warning' : 'text-green-500'}`}>
              {actualRunway.toFixed(1)} meses
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Burn rate mensal médio: {formatCurrency(latestMetrics.burn_rate)}
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${actualRunway < 3 ? 'bg-red-500' : actualRunway < 6 ? 'bg-warning' : 'bg-green-500'}`}
                style={{ width: `${Math.min(actualRunway / 12 * 100, 100)}%` }}
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
            {healthMetrics.map((metric, index) => (
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
