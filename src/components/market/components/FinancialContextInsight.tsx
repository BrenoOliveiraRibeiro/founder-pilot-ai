
import React from "react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "../utils/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface FinancialContextInsightProps {
  tamSamSomData: any[];
  segment: string;
}

export const FinancialContextInsight: React.FC<FinancialContextInsightProps> = ({
  tamSamSomData,
  segment
}) => {
  const { currentEmpresa } = useAuth();
  const { activeIntegrations } = useOpenFinanceConnections();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);
  
  const hasFinanceData = activeIntegrations.length > 0 && metrics;
  const caixaAtual = metrics?.caixa_atual || 0;
  const runwayMeses = metrics?.runway_meses || 0;
  const somValue = tamSamSomData[2]?.value || 0;
  
  // Cálculo de quanto do SOM a empresa poderia atingir com o caixa atual
  const somPercentage = caixaAtual > 0 && somValue > 0 
    ? Math.min(100, (caixaAtual / somValue) * 100).toFixed(1) 
    : 0;

  // Tempo para atingir o SOM baseado no crescimento atual e caixa
  const timeToReachSom = caixaAtual > 0 && metrics?.mrr_growth && metrics.mrr_growth > 0
    ? Math.ceil(somValue / (metrics.receita_mensal * (1 + metrics.mrr_growth/100)))
    : null;
  
  if (!hasFinanceData) return null;

  return (
    <Card className="mt-6 bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          Insights Financeiros Contextualizados
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-md bg-white border">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Caixa vs. Mercado Obtível</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Com seu caixa atual de {formatCurrency(caixaAtual)}, você tem potencial para capturar 
                    aproximadamente <span className="font-medium text-primary">{somPercentage}%</span> do 
                    seu mercado obtível (SOM) de {formatCurrency(somValue)} no setor de {segment}.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-md bg-white border">
              <div className="flex items-start gap-2">
                {runwayMeses < 6 ? (
                  <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                ) : (
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-medium">Análise de Runway vs. Mercado</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {runwayMeses < 6 ? (
                      <>Seu runway atual de <span className="font-medium text-warning">{runwayMeses.toFixed(1)} meses</span> pode 
                      limitar sua capacidade de escalar e alcançar uma fatia significativa do mercado obtível.</>
                    ) : (
                      <>Seu runway atual de <span className="font-medium text-primary">{runwayMeses.toFixed(1)} meses</span> permite 
                      planejar investimentos estratégicos para capturar uma fatia maior do mercado.</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              * Estes insights são baseados nos seus dados financeiros conectados via Open Finance
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/finances">Ver Análise Financeira Completa</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
