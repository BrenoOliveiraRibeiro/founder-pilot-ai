
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Zap } from "lucide-react";

interface FinanceMetricsGridProps {
  selectedDate: Date;
}

export const FinanceMetricsGrid: React.FC<FinanceMetricsGridProps> = ({ selectedDate }) => {
  const currentDate = new Date();
  
  const { 
    saldoCaixa, 
    entradasMesAtual, 
    saidasMesAtual, 
    fluxoCaixaMesAtual,
    loading: transactionsLoading, 
    error: transactionsError 
  } = useTransactionsMetrics({ selectedDate });

  const { 
    metrics: openFinanceMetrics, 
    loading: openFinanceLoading 
  } = useOpenFinanceDashboard();

  const loading = transactionsLoading || openFinanceLoading;
  const hasOpenFinanceData = openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0;
  const hasAnyRealData = hasOpenFinanceData || saldoCaixa > 0 || entradasMesAtual > 0 || saidasMesAtual > 0;
  
  const saldoAtual = saldoCaixa;
  const entradas = entradasMesAtual;
  const saidas = saidasMesAtual;
  const fluxo = fluxoCaixaMesAtual;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-3 w-48 mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (transactionsError) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-red-500 text-center">Erro ao carregar métricas: {transactionsError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAnyRealData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="col-span-full">
          <Alert className="mb-6">
            <Zap className="h-4 w-4" />
            <AlertTitle>Conecte suas contas bancárias</AlertTitle>
            <AlertDescription>
              Para ver métricas dinâmicas e precisas, conecte suas contas bancárias via Open Finance.
            </AlertDescription>
          </Alert>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(0)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Conecte suas contas para ver dados reais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entradas ({format(currentDate, "MMMM yyyy", { locale: pt })})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(0)}</div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                {format(currentDate, "MMMM yyyy", { locale: pt })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saídas ({format(currentDate, "MMMM yyyy", { locale: pt })})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold text-muted-foreground">{formatCurrency(0)}</div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-muted-foreground">
                Fluxo líquido: {formatCurrency(0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(saldoAtual)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {hasOpenFinanceData ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Dados sincronizados do Open Finance
              </span>
            ) : (
              `Acumulado até ${format(selectedDate, "dd/MM/yyyy", { locale: pt })}`
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Entradas ({format(currentDate, "MMMM yyyy", { locale: pt })})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(entradas)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {format(currentDate, "MMMM yyyy", { locale: pt })}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saídas ({format(currentDate, "MMMM yyyy", { locale: pt })})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(saidas)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-muted-foreground">
              Fluxo líquido: {formatCurrency(fluxo)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
