
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

        // Determinar o mês e ano a serem filtrados
        const targetDate = selectedDate || new Date();
        const anoTarget = targetDate.getFullYear();
        const mesTarget = targetDate.getMonth(); // 0-based (0 = Janeiro, 11 = Dezembro)

        console.log('Filtrando dados para:', {
          ano: anoTarget,
          mes: mesTarget + 1,
          dataCompleta: targetDate.toISOString()
        });

        // Definir período do mês selecionado
        const startOfSelectedMonth = new Date(anoTarget, mesTarget, 1);
        const endOfSelectedMonth = new Date(anoTarget, mesTarget + 1, 0, 23, 59, 59);

        console.log('Período do mês selecionado:', {
          inicio: startOfSelectedMonth.toISOString(),
          fim: endOfSelectedMonth.toISOString()
        });

        // Buscar todas as transações até o final do mês selecionado (para calcular saldo)
        const { data: todasTransacoes, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .lte('data_transacao', endOfSelectedMonth.toISOString().split('T')[0])
          .order('data_transacao', { ascending: true });

        if (transacoesError) {
          console.error('Erro ao buscar transações:', transacoesError);
          throw transacoesError;
        }

        console.log('Total de transações encontradas até o mês selecionado:', todasTransacoes?.length || 0);

        // Calcular saldo acumulado até o final do mês selecionado
        const saldoTotal = todasTransacoes?.reduce((acc, tx) => {
          const valor = Number(tx.valor) || 0;
          return acc + valor;
        }, 0) || 0;

        console.log('Saldo total acumulado até o mês selecionado:', saldoTotal);

        // Buscar transações apenas do mês selecionado
        const { data: transacoesMesSelecionado, error: transacoesMesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .gte('data_transacao', startOfSelectedMonth.toISOString().split('T')[0])
          .lte('data_transacao', endOfSelectedMonth.toISOString().split('T')[0])
          .order('data_transacao', { ascending: true });

        if (transacoesMesError) {
          console.error('Erro ao buscar transações do mês:', transacoesMesError);
          throw transacoesMesError;
        }

        console.log('Transações do mês selecionado:', transacoesMesSelecionado?.length || 0);

        if (transacoesMesSelecionado) {
          console.log('Detalhes das transações do mês:', transacoesMesSelecionado.map(tx => ({
            data: tx.data_transacao,
            valor: tx.valor,
            descricao: tx.descricao,
            tipo: tx.tipo
          })));
        }

        // Calcular métricas do mês selecionado
        let entradas = 0;
        let saidas = 0;

        transacoesMesSelecionado?.forEach(tx => {
          const valor = Number(tx.valor) || 0;
          
          if (valor > 0) {
            entradas += valor;
          } else {
            saidas += Math.abs(valor);
          }
        });

        const fluxo = entradas - saidas;

        console.log('Métricas calculadas para o mês:', {
          entradas,
          saidas,
          fluxo,
          saldoTotal,
          mesAno: `${mesTarget + 1}/${anoTarget}`
        });

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
          console.error('Erro de validação:', error.errors);
          setError(`Dados inválidos: ${error.errors.map((e: any) => e.message).join(', ')}`);
        } else {
          setError(error.message || 'Erro ao carregar dados financeiros');
        }
        
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
