
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingDown, AlertTriangle, DollarSign, Wallet, Database } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface MetricsCardsProps {
  cashReserve: number;
  burnRate: number;
  runwayMonths: number;
  estimatedRunoutDate: Date;
  isRealData?: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  cashReserve, 
  burnRate, 
  runwayMonths, 
  estimatedRunoutDate,
  isRealData = false
}) => {
  // Função para determinar a cor do runway baseado no valor em meses
  const getRunwayStatusColor = (months: number) => {
    if (months < 3) return 'bg-destructive/10 border-destructive text-destructive';
    if (months < 6) return 'bg-warning/10 border-warning text-warning-foreground';
    return 'bg-green-100/80 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400';
  };

  // Função para determinar o status do runway
  const getRunwayStatusText = (months: number) => {
    if (months < 3) return 'Crítico';
    if (months < 6) return 'Preocupante';
    return 'Saudável';
  };

  // Função para determinar a cor do burn rate baseado no contexto
  const getBurnRateColor = (burn: number, cash: number) => {
    const burnRatio = (burn / cash) * 100;
    
    if (burnRatio > 15) return 'bg-destructive/10 border-destructive text-destructive';
    if (burnRatio > 8) return 'bg-warning/10 border-warning text-warning-foreground';
    return 'bg-green-100/80 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400';
  };

  // Classes de estilo para os cards
  const runwayCardClass = getRunwayStatusColor(runwayMonths);
  const burnRateCardClass = getBurnRateColor(burnRate, cashReserve);
  const runwayStatusText = getRunwayStatusText(runwayMonths);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      {/* Card de Runway Atual */}
      <Card className={`border-2 transition-all ${runwayCardClass}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Runway Atual</CardTitle>
            <div className="flex gap-1">
              {isRealData && (
                <Badge variant="outline" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Real
                </Badge>
              )}
              <Badge variant={runwayMonths < 3 ? "destructive" : runwayMonths < 6 ? "warning" : "default"}>
                {runwayStatusText}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className={`h-4 w-4 mr-2 ${
              runwayMonths < 3 ? 'text-destructive' : 
              runwayMonths < 6 ? 'text-warning' : 
              'text-green-600 dark:text-green-400'
            }`} />
            <div className={`text-2xl font-bold ${
              runwayMonths < 3 ? 'text-destructive' : 
              runwayMonths < 6 ? 'text-warning' : 
              'text-green-600 dark:text-green-400'
            }`}>
              {runwayMonths.toFixed(1)} meses
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Caixa Atual */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Caixa Atual</CardTitle>
            {isRealData && (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Real
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Wallet className="h-4 w-4 text-blue-500 mr-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(cashReserve)}</div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Burn Rate Mensal */}
      <Card className={`border-2 transition-all ${burnRateCardClass}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Burn Rate Mensal</CardTitle>
            {isRealData && (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Real
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingDown className={`h-4 w-4 mr-2 ${
              getBurnRateColor(burnRate, cashReserve).includes('destructive') ? 'text-destructive' : 
              getBurnRateColor(burnRate, cashReserve).includes('warning') ? 'text-warning' : 
              'text-green-600 dark:text-green-400'
            }`} />
            <div className={`text-2xl font-bold ${
              getBurnRateColor(burnRate, cashReserve).includes('destructive') ? 'text-destructive' : 
              getBurnRateColor(burnRate, cashReserve).includes('warning') ? 'text-warning' : 
              'text-green-600 dark:text-green-400'
            }`}>
              {formatCurrency(burnRate)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {cashReserve > 0 ? (burnRate / cashReserve * 100).toFixed(1) : 0}% do caixa por mês
          </div>
        </CardContent>
      </Card>

      {/* Card de Previsão de Esgotamento */}
      <Card className={`border-2 transition-all ${runwayCardClass}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Previsão de Esgotamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertTriangle className={`h-4 w-4 mr-2 ${
              runwayMonths < 3 ? 'text-destructive' : 
              runwayMonths < 6 ? 'text-warning' : 
              'text-green-600 dark:text-green-400'
            }`} />
            <div className={`text-2xl font-bold ${
              runwayMonths < 3 ? 'text-destructive' : 
              runwayMonths < 6 ? 'text-warning' : 
              'text-green-600 dark:text-green-400'
            }`}>
              {estimatedRunoutDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
