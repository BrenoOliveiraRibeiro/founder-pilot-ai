
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingDown, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MetricsCardsProps {
  cashReserve: number;
  burnRate: number;
  runwayMonths: number;
  estimatedRunoutDate: Date;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  cashReserve, 
  burnRate, 
  runwayMonths, 
  estimatedRunoutDate 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Runway Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <div className={`text-2xl font-bold ${runwayMonths < 3 ? 'text-red-500' : runwayMonths < 6 ? 'text-warning' : 'text-green-500'}`}>
              {runwayMonths.toFixed(1)} meses
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Caixa Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(cashReserve)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Burn Rate Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(burnRate)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Previsão de Esgotamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <AlertTriangle className={`h-4 w-4 ${runwayMonths < 3 ? 'text-red-500' : 'text-warning'} mr-2`} />
            <div className="text-2xl font-bold">
              {estimatedRunoutDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
