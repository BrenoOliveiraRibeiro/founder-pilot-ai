
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { Skeleton } from "@/components/ui/skeleton";

export const RunwayAlert: React.FC = () => {
  const { 
    metrics: openFinanceMetrics, 
    loading: openFinanceLoading 
  } = useOpenFinanceDashboard();

  const { 
    saldoCaixa, 
    entradasMesAtual, 
    saidasMesAtual,
    loading: transactionsLoading 
  } = useTransactionsMetrics({ selectedDate: new Date() });

  const loading = transactionsLoading || openFinanceLoading;
  const hasOpenFinanceData = openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0;
  
  // Verificar se existe algum dado real (transações ou Open Finance)
  const hasAnyRealData = hasOpenFinanceData || saldoCaixa > 0 || entradasMesAtual > 0 || saidasMesAtual > 0;
  
  // Usar dados do Open Finance se disponíveis, caso contrário usar dados de transações
  const saldoAtual = hasOpenFinanceData ? openFinanceMetrics.saldoTotal : saldoCaixa;
  const saidas = hasOpenFinanceData ? openFinanceMetrics.despesasMensais : saidasMesAtual;
  
  // Calcular runway
  const runway = saidas > 0 ? saldoAtual / saidas : 0;

  if (loading) {
    return (
      <div className="mb-6">
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  // Só mostrar alerta se houver dados reais e runway < 6 meses
  if (!hasAnyRealData || runway >= 6) {
    return null;
  }
  
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção! Runway abaixo do recomendado</AlertTitle>
      <AlertDescription>
        Seu runway atual é de {runway.toFixed(1)} meses{hasOpenFinanceData ? ' (dados sincronizados do Open Finance)' : ''}. Recomendamos ter pelo menos 6 meses de runway para segurança.
      </AlertDescription>
    </Alert>
  );
};
