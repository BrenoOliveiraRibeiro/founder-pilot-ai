
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { RunwayChartHeader } from "./runway/RunwayChartHeader";
import { RunwayChartVisualization } from "./runway/RunwayChartVisualization";
import CriticalRunwayAlert from "./runway/CriticalRunwayAlert";

// Função movida para o lib/utils.ts, se precisar usar em outro lugar
const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

export const RunwayChart = () => {
  const { currentEmpresa } = useAuth();
  const { loading, cashRunway, isRunwayCritical, metrics } = useFinanceData(currentEmpresa?.id || null);
  
  // Encontrar o índice onde o saldo fica negativo (ou quase zero)
  const zeroCashIndex = cashRunway.findIndex(item => item.balance <= 0);
  const criticalMonths = cashRunway.slice(0, zeroCashIndex > 0 ? zeroCashIndex : cashRunway.length);
  
  // Calcular o índice para demarcar a zona crítica (3 meses)
  const criticalZoneIndex = cashRunway.findIndex(
    (item, index) => index > 0 && 
    metrics?.runway_meses && 
    (metrics?.runway_meses <= 3) && 
    item.future
  );

  return (
    <Card>
      <CardHeader>
        <RunwayChartHeader 
          isRunwayCritical={isRunwayCritical} 
          runwayMonths={metrics?.runway_meses} 
        />
      </CardHeader>
      <CardContent>
        <RunwayChartVisualization 
          loading={loading}
          cashRunway={cashRunway}
          criticalZoneIndex={criticalZoneIndex}
          zeroCashIndex={zeroCashIndex}
        />
        
        {isRunwayCritical && <CriticalRunwayAlert />}
      </CardContent>
    </Card>
  );
};
