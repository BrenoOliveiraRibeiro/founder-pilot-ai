
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";

export const RunwayAlert: React.FC = () => {
  const { metrics } = useOpenFinanceDashboard();
  const { saldoCaixa, saidasMesAtual } = useTransactionsMetrics();

  // Usar dados do Open Finance se disponíveis, caso contrário calcular com transações
  const hasOpenFinanceData = metrics && metrics.integracoesAtivas > 0;
  const runway = hasOpenFinanceData 
    ? metrics.runwayMeses 
    : (saidasMesAtual > 0 ? saldoCaixa / saidasMesAtual : 0);

  // Só mostrar alerta se runway < 6 meses e há dados reais
  if (runway >= 6 || runway === 0) return null;
  
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção! Runway abaixo do recomendado</AlertTitle>
      <AlertDescription>
        Seu runway atual é de {runway.toFixed(1)} meses baseado em dados reais. Recomendamos ter pelo menos 6 meses de runway para segurança.
      </AlertDescription>
    </Alert>
  );
};
