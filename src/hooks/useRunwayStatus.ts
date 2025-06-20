
import { useMemo } from 'react';
import { useOpenFinanceDashboard } from '@/hooks/useOpenFinanceDashboard';
import { useTransactionsMetrics } from '@/hooks/useTransactionsMetrics';

export interface RunwayStatus {
  months: number;
  status: 'saudavel' | 'atencao' | 'critico';
  label: string;
  color: string;
  hasRealData: boolean;
}

export const useRunwayStatus = (): RunwayStatus => {
  const { metrics: openFinanceMetrics } = useOpenFinanceDashboard();
  const { saldoCaixa, saidasMesAtual } = useTransactionsMetrics();

  return useMemo(() => {
    // Verificar se há dados reais conectados
    const hasOpenFinanceData = openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0;
    const hasTransactionData = saldoCaixa > 0 || saidasMesAtual > 0;

    let runwayMonths = 0;
    let hasRealData = false;

    if (hasOpenFinanceData) {
      runwayMonths = openFinanceMetrics.runwayMeses;
      hasRealData = true;
    } else if (hasTransactionData && saidasMesAtual > 0) {
      runwayMonths = saldoCaixa / saidasMesAtual;
      hasRealData = true;
    }

    // Determinar status baseado no runway
    let status: 'saudavel' | 'atencao' | 'critico';
    let label: string;
    let color: string;

    if (!hasRealData) {
      return {
        months: 0,
        status: 'atencao',
        label: 'Conectar',
        color: 'text-yellow-600 bg-yellow-500/20',
        hasRealData: false
      };
    }

    if (runwayMonths >= 6) {
      status = 'saudavel';
      label = 'Saudável';
      color = 'text-green-600 bg-green-500/20';
    } else if (runwayMonths >= 3) {
      status = 'atencao';
      label = 'Atenção';
      color = 'text-yellow-600 bg-yellow-500/20';
    } else {
      status = 'critico';
      label = 'Crítico';
      color = 'text-red-600 bg-red-500/20';
    }

    return {
      months: runwayMonths,
      status,
      label,
      color,
      hasRealData
    };
  }, [openFinanceMetrics, saldoCaixa, saidasMesAtual]);
};
