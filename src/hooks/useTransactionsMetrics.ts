
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { financeDataSchema, type FinanceData } from '@/schemas/validationSchemas';
import { useBalanceRefresh } from './useBalanceRefresh';

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
  const { refreshBalances } = useBalanceRefresh();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Tentar atualizar saldos das contas conectadas primeiro
        console.log('Atualizando saldos antes de calcular métricas de transações...');
        await refreshBalances();

        // Verificar se há integrações ativas para usar saldo do Open Finance
        const { data: integracoes, error: integracoesError } = await supabase
          .from('integracoes_bancarias')
          .select('account_data')
          .eq('empresa_id', currentEmpresa.id)
          .eq('status', 'ativo')
          .eq('tipo_conexao', 'Open Finance');

        if (integracoesError) {
          console.error('Erro ao buscar integrações:', integracoesError);
        }

        let saldoOpenFinance = 0;
        let temIntegracaoAtiva = false;

        // Calcular saldo total das contas conectadas
        if (integracoes && integracoes.length > 0) {
          temIntegracaoAtiva = true;
          for (const integracao of integracoes) {
            if (integracao.account_data && typeof integracao.account_data === 'object') {
              const accountData = integracao.account_data as any;
              if (accountData.results && Array.isArray(accountData.results)) {
                saldoOpenFinance += accountData.results.reduce((sum: number, account: any) => {
                  return sum + (account.balance || 0);
                }, 0);
              }
            }
          }
        }

        // Buscar todas as transações
        const { data: transacoes, error: transacoesError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id);

        if (transacoesError) throw transacoesError;

        if (!transacoes || transacoes.length === 0) {
          // Se há integração ativa, usar saldo do Open Finance
          if (temIntegracaoAtiva) {
            setSaldoCaixa(saldoOpenFinance);
          }
          setLoading(false);
          return;
        }

        // Determinar o mês a ser filtrado
        const targetDate = selectedDate || new Date();
        const anoTarget = targetDate.getFullYear();
        const mesTarget = targetDate.getMonth();

        // Se há integração ativa, usar saldo do Open Finance; senão, calcular baseado em transações
        let saldoFinal = saldoOpenFinance;
        if (!temIntegracaoAtiva) {
          // Calcular saldo total até a data selecionada (inclusive)
          const endOfSelectedMonth = new Date(anoTarget, mesTarget + 1, 0);
          saldoFinal = transacoes
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
          saldoCaixa: saldoFinal,
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
