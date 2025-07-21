
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBalanceRefresh } from './useBalanceRefresh';
import { separateAccountsByType, getCreditUtilizationPercentage } from '@/utils/accountSeparation';

interface CreditMetrics {
  totalCreditLimit: number;
  usedCreditLimit: number;
  availableCreditLimit: number;
  utilizationPercentage: number;
  nextDueBills: any[];
  creditAccounts: any[];
}

interface DebitMetrics {
  realCashBalance: number;
  runwayMonths: number;
  debitAccounts: any[];
}

interface SeparatedFinanceMetrics extends DebitMetrics {
  creditMetrics: CreditMetrics;
  receitaMensal: number;
  despesasMensais: number;
  fluxoCaixa: number;
  burnRate: number;
  ultimaAtualizacao: string | null;
  integracoesAtivas: number;
  alertaCritico: boolean;
  isCriticalCreditUsage: boolean;
}

export const useSeparatedFinanceData = () => {
  const [metrics, setMetrics] = useState<SeparatedFinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentEmpresa } = useAuth();
  const { refreshBalance } = useBalanceRefresh();

  const fetchSeparatedFinanceData = async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`[SEPARATED FINANCE] Iniciando fetch para empresa: ${currentEmpresa.id}`);

      // Buscar integrações ativas
      const { data: integracoes, error: integracoesError } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .eq('status', 'ativo');

      if (integracoesError) throw integracoesError;

      const integracoesAtivas = integracoes?.length || 0;
      console.log(`[SEPARATED FINANCE] ${integracoesAtivas} integrações ativas encontradas`);

      if (integracoesAtivas === 0) {
        console.log('[SEPARATED FINANCE] Nenhuma integração ativa, retornando dados zero');
        setMetrics({
          realCashBalance: 0,
          runwayMonths: 0,
          debitAccounts: [],
          creditMetrics: {
            totalCreditLimit: 0,
            usedCreditLimit: 0,
            availableCreditLimit: 0,
            utilizationPercentage: 0,
            nextDueBills: [],
            creditAccounts: []
          },
          receitaMensal: 0,
          despesasMensais: 0,
          fluxoCaixa: 0,
          burnRate: 0,
          ultimaAtualizacao: null,
          integracoesAtivas: 0,
          alertaCritico: false,
          isCriticalCreditUsage: false
        });
        setLoading(false);
        return;
      }

      // Processar contas de todas as integrações
      let allAccounts: any[] = [];
      let ultimaAtualizacao: string | null = null;

      for (const integracao of integracoes || []) {
        console.log(`[SEPARATED FINANCE] Processando integração: ${integracao.nome_banco} (${integracao.id})`);
        
        try {
          if (integracao.item_id) {
            // Refresh do saldo via API
            const updatedAccountData = await refreshBalance(integracao.item_id, false);
            console.log(`[SEPARATED FINANCE] Dados atualizados via API:`, updatedAccountData);
            
            if (updatedAccountData?.results) {
              allAccounts = [...allAccounts, ...updatedAccountData.results];
            } else if (integracao.account_data && typeof integracao.account_data === 'object') {
              // Fallback para dados existentes
              const accountData = integracao.account_data as any;
              if (accountData.results && Array.isArray(accountData.results)) {
                console.log(`[SEPARATED FINANCE] Usando dados existentes:`, accountData.results);
                allAccounts = [...allAccounts, ...accountData.results];
              }
            }
          }
        } catch (refreshError) {
          console.error(`[SEPARATED FINANCE] Erro ao atualizar saldo da integração ${integracao.id}:`, refreshError);
          // Usar dados existentes em caso de erro
          if (integracao.account_data && typeof integracao.account_data === 'object') {
            const accountData = integracao.account_data as any;
            if (accountData.results && Array.isArray(accountData.results)) {
              console.log(`[SEPARATED FINANCE] Usando dados existentes após erro:`, accountData.results);
              allAccounts = [...allAccounts, ...accountData.results];
            }
          }
        }
        
        if (integracao.ultimo_sincronismo) {
          if (!ultimaAtualizacao || new Date(integracao.ultimo_sincronismo) > new Date(ultimaAtualizacao)) {
            ultimaAtualizacao = integracao.ultimo_sincronismo;
          }
        }
      }

      console.log(`[SEPARATED FINANCE] Total de ${allAccounts.length} contas processadas:`, allAccounts);

      // Separar contas por tipo
      const separated = separateAccountsByType(allAccounts);

      // Buscar transações para cálculos de fluxo
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .gte('data_transacao', threeMonthsAgo.toISOString().split('T')[0]);

      if (transacoesError) throw transacoesError;

      console.log(`[SEPARATED FINANCE] ${transacoes?.length || 0} transações encontradas nos últimos 3 meses`);

      // Calcular métricas baseadas nas transações
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const transacoesMesAtual = (transacoes || []).filter(tx => {
        const dataTransacao = new Date(tx.data_transacao);
        return dataTransacao.getMonth() === mesAtual && dataTransacao.getFullYear() === anoAtual;
      });

      console.log(`[SEPARATED FINANCE] ${transacoesMesAtual.length} transações no mês atual`);

      // Calcular receitas e despesas do mês atual
      const receitaMensal = transacoesMesAtual
        .filter(tx => {
          const isReceita = tx.tipo === 'receita' || tx.valor > 0;
          console.log(`[TRANSACTION] ${tx.descricao}: ${tx.valor} - ${isReceita ? 'RECEITA' : 'DESPESA'}`);
          return isReceita;
        })
        .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

      const despesasMensais = transacoesMesAtual
        .filter(tx => {
          const isDespesa = tx.tipo === 'despesa' || tx.valor < 0;
          return isDespesa;
        })
        .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

      console.log(`[SEPARATED FINANCE] Receita mensal: ${receitaMensal}, Despesas mensais: ${despesasMensais}`);

      const fluxoCaixa = receitaMensal - despesasMensais;

      // Calcular burn rate médio dos últimos 3 meses (apenas despesas)
      const despesasUltimos3Meses = (transacoes || [])
        .filter(tx => tx.tipo === 'despesa' || tx.valor < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

      const burnRate = despesasUltimos3Meses / 3;
      console.log(`[SEPARATED FINANCE] Burn rate médio (3 meses): ${burnRate}`);

      // Calcular runway usando APENAS o saldo de caixa real (sem crédito)
      const runwayMonths = burnRate > 0 ? separated.realCashBalance / burnRate : 0;
      const alertaCritico = runwayMonths < 3;

      console.log(`[SEPARATED FINANCE] Runway calculado: ${runwayMonths} meses (crítico: ${alertaCritico})`);

      // Métricas de crédito
      const utilizationPercentage = getCreditUtilizationPercentage(
        separated.usedCreditLimit,
        separated.totalCreditLimit
      );
      const isCriticalCreditUsage = utilizationPercentage > 80;

      // Calcular próximas faturas (simulado - em produção viria das transações de crédito)
      const nextDueBills = separated.creditAccounts.map(account => ({
        accountName: account.name,
        amount: Math.abs(account.balance || 0),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias a partir de hoje
        bankName: 'Banco'
      }));

      const result: SeparatedFinanceMetrics = {
        realCashBalance: separated.realCashBalance,
        runwayMonths,
        debitAccounts: separated.debitAccounts,
        creditMetrics: {
          totalCreditLimit: separated.totalCreditLimit,
          usedCreditLimit: separated.usedCreditLimit,
          availableCreditLimit: separated.availableCreditLimit,
          utilizationPercentage,
          nextDueBills,
          creditAccounts: separated.creditAccounts
        },
        receitaMensal,
        despesasMensais,
        fluxoCaixa,
        burnRate,
        ultimaAtualizacao,
        integracoesAtivas,
        alertaCritico,
        isCriticalCreditUsage
      };

      console.log('[SEPARATED FINANCE] Métricas finais calculadas:', result);
      setMetrics(result);

    } catch (error: any) {
      console.error('Erro ao buscar dados financeiros separados:', error);
      setError(error.message || 'Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeparatedFinanceData();
  }, [currentEmpresa?.id]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchSeparatedFinanceData
  };
};
