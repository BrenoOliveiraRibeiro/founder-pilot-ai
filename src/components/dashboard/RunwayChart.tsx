
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          Saldo: {formatCurrency(payload[0].value)}
        </p>
        {payload[0].payload.future && (
          <p className="text-xs text-muted-foreground mt-1">
            (Projeção)
          </p>
        )}
      </div>
    );
  }

  return null;
};

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
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Projeção de Runway</CardTitle>
          {isRunwayCritical && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle size={14} />
              <span>Runway Crítico</span>
            </Badge>
          )}
        </div>
        <CardDescription>
          Com base na sua taxa atual de queima de caixa
          {metrics?.runway_meses && (
            <span className="ml-2 font-medium">
              (Estimativa: {metrics.runway_meses.toFixed(1)} meses)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-80">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cashRunway}
                margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$${Math.abs(value / 1000)}k`}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Zone de risco (runway < 3 meses) */}
                {criticalZoneIndex > 0 && (
                  <ReferenceArea 
                    x1={cashRunway[criticalZoneIndex]?.month} 
                    x2={cashRunway[zeroCashIndex > 0 ? zeroCashIndex : cashRunway.length - 1]?.month}
                    y1={0}
                    y2="dataMax"
                    fill="hsl(var(--destructive))"
                    fillOpacity={0.1}
                    stroke="hsl(var(--destructive))"
                    strokeOpacity={0.3}
                    strokeDasharray="3 3"
                  />
                )}
                
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {isRunwayCritical && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h4 className="font-medium">Alerta: Runway Crítico</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Seu runway atual está abaixo de 3 meses. Considere reduzir despesas ou buscar financiamento
                  adicional imediatamente para evitar problemas de fluxo de caixa.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
