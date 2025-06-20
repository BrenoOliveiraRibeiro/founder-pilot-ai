
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { financeDataSchema, type FinanceData } from '@/schemas/validationSchemas';

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

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar todas as transações
        const { data: transacoes, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id);

        if (transacoesError) throw transacoesError;

        if (!transacoes || transacoes.length === 0) {
          // Não há transações, manter valores em zero
          setLoading(false);
          return;
        }

        // Determinar o mês a ser filtrado
        const targetDate = selectedDate || new Date();
        const anoTarget = targetDate.getFullYear();
        const mesTarget = targetDate.getMonth();

        // Buscar saldo atual das contas conectadas primeiro
        const { data: transacoesComSaldo } = await supabase
          .from('transacoes')
          .select('saldo_conta, data_transacao')
          .eq('empresa_id', currentEmpresa.id)
          .not('saldo_conta', 'is', null)
          .order('data_transacao', { ascending: false })
          .limit(10);

        let saldoAtualContas = 0;
        
        // Calcular saldo das contas conectadas a partir dos dados mais recentes
        if (transacoesComSaldo && transacoesComSaldo.length > 0) {
          const contasProcessadas = new Set();
          
          for (const transacao of transacoesComSaldo) {
            if (transacao.saldo_conta && typeof transacao.saldo_conta === 'object') {
              const saldoData = transacao.saldo_conta as any;
              const contaId = saldoData.accountId || JSON.stringify(saldoData);
              
              if (!contasProcessadas.has(contaId)) {
                saldoAtualContas += saldoData.balance || 0;
                contasProcessadas.add(contaId);
              }
            }
          }
        }

        // Se temos saldo das contas conectadas, usar este valor
        // Caso contrário, calcular saldo acumulado das transações
        let saldoTotal;
        if (saldoAtualContas > 0) {
          saldoTotal = saldoAtualContas;
        } else {
          // Calcular saldo total até a data selecionada (inclusive)
          const endOfSelectedMonth = new Date(anoTarget, mesTarget + 1, 0);
          saldoTotal = transacoes
            .filter(tx => new Date(tx.data_transacao) <= endOfSelectedMonth)
            .reduce((acc, tx) => {
              return acc + Number(tx.valor);
            }, 0);
        }

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
        
        // Se for erro de validação Zod, mostrar erro mais específico
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
  }, [currentEmpresa?.id, selectedDate]);

  return {
    saldoCaixa,
    entradasMesAtual,
    saidasMesAtual,
    fluxoCaixaMesAtual,
    loading,
    error
  };
};
