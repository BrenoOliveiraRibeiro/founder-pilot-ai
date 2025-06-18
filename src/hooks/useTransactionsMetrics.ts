
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

        const targetDate = selectedDate || new Date();
        const anoTarget = targetDate.getFullYear();
        const mesTarget = targetDate.getMonth() + 1; // Converter para 1-based (1 = Janeiro, 12 = Dezembro)

        console.log('=== FILTRO DE MÊS ===');
        console.log('Data selecionada:', targetDate.toISOString());
        console.log('Ano alvo:', anoTarget);
        console.log('Mês alvo:', mesTarget);
        console.log('Empresa ID:', currentEmpresa.id);

        // Calcular corretamente o último dia do mês
        const endOfMonth = new Date(anoTarget, mesTarget, 0); // Dia 0 do próximo mês = último dia do mês atual
        const endOfMonthStr = `${anoTarget}-${String(mesTarget).padStart(2, '0')}-${String(endOfMonth.getDate()).padStart(2, '0')}`;
        
        console.log('Último dia do mês:', endOfMonthStr);

        // 1. Buscar saldo acumulado até o final do mês selecionado
        const { data: saldoData, error: saldoError } = await supabase
          .from('transacoes')
          .select('valor')
          .eq('empresa_id', currentEmpresa.id)
          .lte('data_transacao', endOfMonthStr);

        if (saldoError) {
          console.error('Erro ao buscar saldo:', saldoError);
          throw saldoError;
        }

        console.log('Transações para saldo (até', endOfMonthStr, '):', saldoData?.length || 0);

        const saldoCalculado = saldoData?.reduce((acc, tx) => {
          const valor = Number(tx.valor) || 0;
          return acc + valor;
        }, 0) || 0;

        console.log('Saldo calculado:', saldoCalculado);

        // 2. Buscar transações específicas do mês selecionado usando EXTRACT
        const { data: transacoesMes, error: transacoesMesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .filter('data_transacao', 'gte', `${anoTarget}-${String(mesTarget).padStart(2, '0')}-01`)
          .filter('data_transacao', 'lte', endOfMonthStr)
          .order('data_transacao', { ascending: true });

        if (transacoesMesError) {
          console.error('Erro ao buscar transações do mês:', transacoesMesError);
          throw transacoesMesError;
        }

        console.log('Transações do mês', mesTarget + '/' + anoTarget, ':', transacoesMes?.length || 0);

        if (transacoesMes && transacoesMes.length > 0) {
          console.log('Detalhes das transações do mês:');
          transacoesMes.forEach((tx, index) => {
            console.log(`${index + 1}. ${tx.data_transacao} - R$ ${tx.valor} - ${tx.descricao}`);
          });
        }

        // 3. Calcular entradas e saídas do mês
        let entradas = 0;
        let saidas = 0;

        transacoesMes?.forEach(tx => {
          const valor = Number(tx.valor) || 0;
          
          if (valor > 0) {
            entradas += valor;
          } else {
            saidas += Math.abs(valor);
          }
        });

        const fluxo = entradas - saidas;

        console.log('=== RESULTADO FINAL ===');
        console.log('Saldo em caixa:', saldoCalculado);
        console.log('Entradas do mês:', entradas);
        console.log('Saídas do mês:', saidas);
        console.log('Fluxo do mês:', fluxo);
        console.log('======================');

        // 4. Validar e definir estado
        const metricsData: FinanceData = {
          saldoCaixa: saldoCalculado,
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
