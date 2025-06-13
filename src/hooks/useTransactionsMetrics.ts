
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TransactionsMetrics {
  saldoCaixa: number;
  entradasMesAtual: number;
  saidasMesAtual: number;
  fluxoCaixaMesAtual: number;
  loading: boolean;
  error: string | null;
}

export const useTransactionsMetrics = (): TransactionsMetrics => {
  const [metrics, setMetrics] = useState<TransactionsMetrics>({
    saldoCaixa: 0,
    entradasMesAtual: 0,
    saidasMesAtual: 0,
    fluxoCaixaMesAtual: 0,
    loading: true,
    error: null,
  });

  const { currentEmpresa } = useAuth();

  useEffect(() => {
    const fetchTransactionsMetrics = async () => {
      if (!currentEmpresa?.id) {
        setMetrics(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setMetrics(prev => ({ ...prev, loading: true, error: null }));

        // Buscar todas as transações da empresa
        const { data: transacoes, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id);

        if (error) {
          throw error;
        }

        if (!transacoes || transacoes.length === 0) {
          setMetrics(prev => ({ ...prev, loading: false }));
          return;
        }

        // Calcular saldo total (soma de todas as transações)
        const saldoCaixa = transacoes.reduce((total, tx) => total + Number(tx.valor), 0);

        // Filtrar transações do mês atual
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const transacoesMesAtual = transacoes.filter(tx => {
          const txDate = new Date(tx.data_transacao);
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        });

        // Calcular entradas e saídas do mês atual
        const entradasMesAtual = transacoesMesAtual
          .filter(tx => tx.tipo === 'receita')
          .reduce((total, tx) => total + Number(tx.valor), 0);

        const saidasMesAtual = Math.abs(transacoesMesAtual
          .filter(tx => tx.tipo === 'despesa')
          .reduce((total, tx) => total + Math.abs(Number(tx.valor)), 0));

        const fluxoCaixaMesAtual = entradasMesAtual - saidasMesAtual;

        setMetrics({
          saldoCaixa,
          entradasMesAtual,
          saidasMesAtual,
          fluxoCaixaMesAtual,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Erro ao buscar métricas de transações:', error);
        setMetrics(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Erro ao carregar dados',
        }));
      }
    };

    fetchTransactionsMetrics();
  }, [currentEmpresa?.id]);

  return metrics;
};
