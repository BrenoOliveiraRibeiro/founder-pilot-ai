
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { financeDataSchema, type FinanceData } from '@/schemas/validationSchemas';
import { useOpenFinanceDashboard } from './useOpenFinanceDashboard';

interface UseTransactionsMetricsProps {
  selectedDate?: Date;
}

export const useTransactionsMetrics = ({ selectedDate }: UseTransactionsMetricsProps = {}) => {
  const [saldoCaixa, setSaldoCaixa] = useState(0);
  const [entradasMesAtual, setEntradasMesAtual] = useState(0);
  const [saidasMesAtual, setSaidasMesAtual] = useState(0);
  const [fluxoCaixaMesAtual, setFluxoCaixaMesAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentEmpresa } = useAuth();
  
  // Usar dados do Open Finance quando disponíveis
  const { metrics: openFinanceMetrics, loading: openFinanceLoading } = useOpenFinanceDashboard();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Se há dados do Open Finance disponíveis, usar eles
        if (openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0) {
          setSaldoCaixa(openFinanceMetrics.saldoTotal);
          setEntradasMesAtual(openFinanceMetrics.receitaMensal);
          setSaidasMesAtual(openFinanceMetrics.despesasMensais);
          setFluxoCaixaMesAtual(openFinanceMetrics.fluxoCaixa);
          setLoading(false);
          return;
        }

        // Fallback para cálculo baseado apenas em transações
        const { data: transacoes, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id);

        if (transacoesError) throw transacoesError;

        if (!transacoes || transacoes.length === 0) {
          setLoading(false);
          return;
        }

        // Determinar o mês a ser filtrado
        const targetDate = selectedDate || new Date();
        const anoTarget = targetDate.getFullYear();
        const mesTarget = targetDate.getMonth();

        // Calcular saldo total até a data selecionada (inclusive)
        const endOfSelectedMonth = new Date(anoTarget, mesTarget + 1, 0);
        const saldoTotal = transacoes
          .filter(tx => new Date(tx.data_transacao) <= endOfSelectedMonth)
          .reduce((acc, tx) => {
            return acc + Number(tx.valor);
          }, 0);

        // Filtrar transações do mês selecionado
        const transacoesMesSelecionado = transacoes.filter(tx => {
          const dataTransacao = new Date(tx.data_transacao);
          return dataTransacao.getFullYear() === anoTarget && 
                 dataTransacao.getMonth() === mesTarget;
        });

        // Calcular métricas do mês selecionado
        let entradas = 0;
        let saidas = 0;

        transacoesMesSelecionado.forEach(tx => {
          const valor = Number(tx.valor);
          if (valor > 0) {
            entradas += valor;
          } else {
            saidas += Math.abs(valor);
          }
        });

        const fluxo = entradas - saidas;

        // Validar dados antes de definir estado
        const metricsData: FinanceData = {
          saldoCaixa: saldoTotal,
          entradasMesAtual: entradas,
          saidasMesAtual: saidas,
          fluxoCaixaMesAtual: fluxo,
        };

        const validatedData = financeDataSchema.parse(metricsData);

        setSaldoCaixa(validatedData.saldoCaixa);
        setEntradasMesAtual(validatedData.entradasMesAtual);
        setSaidasMesAtual(validatedData.saidasMesAtual);
        setFluxoCaixaMesAtual(validatedData.fluxoCaixaMesAtual);

      } catch (error: any) {
        console.error('Erro ao carregar métricas de transações:', error);
        
        if (error.name === 'ZodError') {
          setError(`Dados inválidos: ${error.errors.map((e: any) => e.message).join(', ')}`);
        } else {
          setError(error.message || 'Erro ao carregar dados financeiros');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [currentEmpresa?.id, selectedDate, openFinanceMetrics, openFinanceLoading]);

  return {
    saldoCaixa,
    entradasMesAtual,
    saidasMesAtual,
    fluxoCaixaMesAtual,
    loading: loading || openFinanceLoading,
    error
  };
};
