import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { financeDataSchema, type FinanceData } from '@/schemas/validationSchemas';
import { useRealtimeUpdates } from './useRealtimeUpdates';

export const useTransactionsMetrics = () => {
  const [saldoCaixa, setSaldoCaixa] = useState(0);
  const [entradasMesAtual, setEntradasMesAtual] = useState(0);
  const [saidasMesAtual, setSaidasMesAtual] = useState(0);
  const [fluxoCaixaMesAtual, setFluxoCaixaMesAtual] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentEmpresa } = useAuth();

  const fetchMetrics = async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', currentEmpresa.id);

      if (transacoesError) throw transacoesError;

      if (!transacoes || transacoes.length === 0) {
        setLoading(false);
        return;
      }

      const saldoTotal = transacoes.reduce((acc, tx) => {
        return acc + Number(tx.valor);
      }, 0);

      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth();

      const transacoesMesAtual = transacoes.filter(tx => {
        const dataTransacao = new Date(tx.data_transacao);
        return dataTransacao.getFullYear() === anoAtual && 
               dataTransacao.getMonth() === mesAtual;
      });

      let entradas = 0;
      let saidas = 0;

      transacoesMesAtual.forEach(tx => {
        const valor = Number(tx.valor);
        if (valor > 0) {
          entradas += valor;
        } else {
          saidas += Math.abs(valor);
        }
      });

      const fluxo = entradas - saidas;

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

  useRealtimeUpdates({
    onTransactionUpdate: fetchMetrics
  });

  useEffect(() => {
    fetchMetrics();
  }, [currentEmpresa?.id]);

  return {
    saldoCaixa,
    entradasMesAtual,
    saidasMesAtual,
    fluxoCaixaMesAtual,
    loading,
    error
  };
};
