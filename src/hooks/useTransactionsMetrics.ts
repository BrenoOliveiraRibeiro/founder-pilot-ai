
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

        console.log('Buscando métricas para empresa:', currentEmpresa.id);
        console.log('Data selecionada:', selectedDate);

        // Determinar o mês e ano a serem filtrados
        const targetDate = selectedDate || new Date();
        const anoTarget = targetDate.getFullYear();
        const mesTarget = targetDate.getMonth(); // 0-based (0 = Janeiro, 11 = Dezembro)

        console.log('Filtrando para ano:', anoTarget, 'mês:', mesTarget + 1); // +1 para mostrar mês 1-based no log

        // Buscar todas as transações
        const { data: transacoes, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .order('data_transacao', { ascending: true });

        if (transacoesError) {
          console.error('Erro ao buscar transações:', transacoesError);
          throw transacoesError;
        }

        console.log('Total de transações encontradas:', transacoes?.length || 0);

        if (!transacoes || transacoes.length === 0) {
          console.log('Não há transações, mantendo valores em zero');
          setSaldoCaixa(0);
          setEntradasMesAtual(0);
          setSaidasMesAtual(0);
          setFluxoCaixaMesAtual(0);
          setLoading(false);
          return;
        }

        // Calcular saldo acumulado até o final do mês selecionado
        const endOfSelectedMonth = new Date(anoTarget, mesTarget + 1, 0, 23, 59, 59); // último dia do mês selecionado
        console.log('Calculando saldo até:', endOfSelectedMonth.toISOString());

        const saldoTotal = transacoes
          .filter(tx => {
            const dataTransacao = new Date(tx.data_transacao);
            const isBeforeOrInSelectedMonth = dataTransacao <= endOfSelectedMonth;
            return isBeforeOrInSelectedMonth;
          })
          .reduce((acc, tx) => {
            const valor = Number(tx.valor) || 0;
            return acc + valor;
          }, 0);

        console.log('Saldo total calculado até o mês selecionado:', saldoTotal);

        // Filtrar transações apenas do mês selecionado
        const startOfSelectedMonth = new Date(anoTarget, mesTarget, 1); // primeiro dia do mês
        const endOfSelectedMonthForFilter = new Date(anoTarget, mesTarget + 1, 0, 23, 59, 59); // último dia do mês

        const transacoesMesSelecionado = transacoes.filter(tx => {
          const dataTransacao = new Date(tx.data_transacao);
          return dataTransacao >= startOfSelectedMonth && dataTransacao <= endOfSelectedMonthForFilter;
        });

        console.log('Transações do mês selecionado:', transacoesMesSelecionado.length);
        console.log('Período filtrado:', {
          inicio: startOfSelectedMonth.toISOString(),
          fim: endOfSelectedMonthForFilter.toISOString()
        });

        // Calcular métricas do mês selecionado
        let entradas = 0;
        let saidas = 0;

        transacoesMesSelecionado.forEach(tx => {
          const valor = Number(tx.valor) || 0;
          console.log('Processando transação:', {
            data: tx.data_transacao,
            valor: valor,
            descricao: tx.descricao,
            tipo: tx.tipo
          });
          
          if (valor > 0) {
            entradas += valor;
          } else {
            saidas += Math.abs(valor);
          }
        });

        const fluxo = entradas - saidas;

        console.log('Métricas calculadas para o mês selecionado:', {
          entradas,
          saidas,
          fluxo,
          saldoTotal
        });

        // Validar dados antes de definir estado
        const metricsData: FinanceData = {
          saldoCaixa: saldoTotal,
          entradasMesAtual: entradas,
          saidasMesAtual: saidas,
          fluxoCaixaMesAtual: fluxo,
        };

        console.log('Dados para validação:', metricsData);

        const validatedData = financeDataSchema.parse(metricsData);

        console.log('Dados validados com sucesso:', validatedData);

        setSaldoCaixa(validatedData.saldoCaixa);
        setEntradasMesAtual(validatedData.entradasMesAtual);
        setSaidasMesAtual(validatedData.saidasMesAtual);
        setFluxoCaixaMesAtual(validatedData.fluxoCaixaMesAtual);

      } catch (error: any) {
        console.error('Erro ao carregar métricas de transações:', error);
        
        // Se for erro de validação Zod, mostrar erro mais específico
        if (error.name === 'ZodError') {
          console.error('Erro de validação:', error.errors);
          setError(`Dados inválidos: ${error.errors.map((e: any) => e.message).join(', ')}`);
        } else {
          setError(error.message || 'Erro ao carregar dados financeiros');
        }
        
        // Em caso de erro, definir valores padrão para não deixar a tela em branco
        setSaldoCaixa(0);
        setEntradasMesAtual(0);
        setSaidasMesAtual(0);
        setFluxoCaixaMesAtual(0);
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
