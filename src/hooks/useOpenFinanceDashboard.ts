
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface OpenFinanceMetrics {
  saldoTotal: number;
  receitaMensal: number;
  despesasMensais: number;
  fluxoCaixa: number;
  runwayMeses: number;
  burnRate: number;
  ultimaAtualizacao: string | null;
  integracoesAtivas: number;
  alertaCritico: boolean;
}

export const useOpenFinanceDashboard = () => {
  const [metrics, setMetrics] = useState<OpenFinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const fetchOpenFinanceData = async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar integrações ativas
      const { data: integracoes, error: integracoesError } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .eq('status', 'ativo')
        .eq('tipo_conexao', 'Open Finance');

      if (integracoesError) throw integracoesError;

      const integracoesAtivas = integracoes?.length || 0;

      if (integracoesAtivas === 0) {
        setMetrics({
          saldoTotal: 0,
          receitaMensal: 0,
          despesasMensais: 0,
          fluxoCaixa: 0,
          runwayMeses: 0,
          burnRate: 0,
          ultimaAtualizacao: null,
          integracoesAtivas: 0,
          alertaCritico: false
        });
        setLoading(false);
        return;
      }

      // Buscar transações mais recentes para obter saldo atual das contas conectadas
      const { data: transacoesRecentes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('saldo_conta, data_transacao')
        .eq('empresa_id', currentEmpresa.id)
        .not('saldo_conta', 'is', null)
        .order('data_transacao', { ascending: false })
        .limit(10);

      if (transacoesError) {
        console.error('Erro ao buscar transações com saldo:', transacoesError);
      }

      // Calcular saldo total das contas conectadas a partir dos dados mais recentes
      let saldoTotal = 0;
      let ultimaAtualizacao: string | null = null;

      // Se temos dados de saldo nas transações, usar estes
      if (transacoesRecentes && transacoesRecentes.length > 0) {
        const contasProcessadas = new Set();
        
        for (const transacao of transacoesRecentes) {
          if (transacao.saldo_conta && typeof transacao.saldo_conta === 'object') {
            const saldoData = transacao.saldo_conta as any;
            const contaId = saldoData.accountId || 'default';
            
            if (!contasProcessadas.has(contaId)) {
              saldoTotal += saldoData.balance || 0;
              contasProcessadas.add(contaId);
            }
          }
          
          if (!ultimaAtualizacao || transacao.data_transacao > ultimaAtualizacao) {
            ultimaAtualizacao = transacao.data_transacao;
          }
        }
      } else {
        // Fallback para account_data nas integrações
        for (const integracao of integracoes || []) {
          if (integracao.account_data && typeof integracao.account_data === 'object') {
            const accountData = integracao.account_data as any;
            if (accountData.results && Array.isArray(accountData.results)) {
              saldoTotal += accountData.results.reduce((sum: number, account: any) => {
                return sum + (account.balance || 0);
              }, 0);
            }
          }
          
          if (integracao.ultimo_sincronismo) {
            if (!ultimaAtualizacao || new Date(integracao.ultimo_sincronismo) > new Date(ultimaAtualizacao)) {
              ultimaAtualizacao = integracao.ultimo_sincronismo;
            }
          }
        }
      }

      // Buscar transações dos últimos 3 meses para calcular métricas
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transacoes, error: transacoesMetricasError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .gte('data_transacao', threeMonthsAgo.toISOString().split('T')[0]);

      if (transacoesMetricasError) throw transacoesMetricasError;

      // Calcular métricas baseadas nas transações
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const transacoesMesAtual = transacoes?.filter(tx => {
        const dataTransacao = new Date(tx.data_transacao);
        return dataTransacao.getMonth() === mesAtual && dataTransacao.getFullYear() === anoAtual;
      }) || [];

      const receitaMensal = transacoesMesAtual
        .filter(tx => tx.tipo === 'receita')
        .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

      const despesasMensais = transacoesMesAtual
        .filter(tx => tx.tipo === 'despesa')
        .reduce((sum, tx) => sum + Math.abs(tx.valor), 0);

      const fluxoCaixa = receitaMensal - despesasMensais;

      // Calcular burn rate médio dos últimos 3 meses
      const burnRate = Math.abs((transacoes || [])
        .filter(tx => tx.tipo === 'despesa')
        .reduce((sum, tx) => sum + tx.valor, 0)) / 3;

      // Calcular runway
      const runwayMeses = burnRate > 0 ? saldoTotal / burnRate : 0;
      const alertaCritico = runwayMeses < 3;

      setMetrics({
        saldoTotal,
        receitaMensal,
        despesasMensais,
        fluxoCaixa,
        runwayMeses,
        burnRate,
        ultimaAtualizacao,
        integracoesAtivas,
        alertaCritico
      });

    } catch (error: any) {
      console.error('Erro ao buscar dados do Open Finance:', error);
      setError(error.message || 'Erro ao carregar dados financeiros');
      
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do Open Finance. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenFinanceData();
  }, [currentEmpresa?.id]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchOpenFinanceData
  };
};
