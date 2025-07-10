
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useBalanceRefresh } from './useBalanceRefresh';

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
  const { refreshBalance } = useBalanceRefresh();

  const fetchOpenFinanceData = async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Buscando dados do Open Finance para o dashboard...');

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

      console.log(`Encontradas ${integracoesAtivas} integrações ativas`);

      // Refresh do saldo para todas as integrações ativas
      let saldoTotal = 0;
      let ultimaAtualizacao: string | null = null;

      for (const integracao of integracoes || []) {
        try {
          if (integracao.item_id) {
            console.log(`Atualizando saldo para integração: ${integracao.nome_banco}`);
            
            // Refresh do saldo via API
            const updatedAccountData = await refreshBalance(integracao.item_id, false);
            
            if (updatedAccountData?.results) {
              const integracaoSaldo = updatedAccountData.results.reduce((sum: number, account: any) => {
                return sum + (account.balance || 0);
              }, 0);
              
              saldoTotal += integracaoSaldo;
              console.log(`Saldo da integração ${integracao.nome_banco}: ${integracaoSaldo}`);
            } else if (integracao.account_data && typeof integracao.account_data === 'object') {
              // Fallback para dados existentes
              const accountData = integracao.account_data as any;
              if (accountData.results && Array.isArray(accountData.results)) {
                saldoTotal += accountData.results.reduce((sum: number, account: any) => {
                  return sum + (account.balance || 0);
                }, 0);
              }
            }
          }
        } catch (refreshError) {
          console.error(`Erro ao atualizar saldo da integração ${integracao.id}:`, refreshError);
          // Usar dados existentes em caso de erro
          if (integracao.account_data && typeof integracao.account_data === 'object') {
            const accountData = integracao.account_data as any;
            if (accountData.results && Array.isArray(accountData.results)) {
              saldoTotal += accountData.results.reduce((sum: number, account: any) => {
                return sum + (account.balance || 0);
              }, 0);
            }
          }
        }
        
        if (integracao.ultimo_sincronismo) {
          if (!ultimaAtualizacao || new Date(integracao.ultimo_sincronismo) > new Date(ultimaAtualizacao)) {
            ultimaAtualizacao = integracao.ultimo_sincronismo;
          }
        }
      }

      console.log(`Saldo total calculado: ${saldoTotal}`);

      // Buscar transações dos últimos 3 meses para calcular métricas
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: transacoes, error: transacoesError } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .gte('data_transacao', threeMonthsAgo.toISOString().split('T')[0]);

      if (transacoesError) throw transacoesError;

      // Calcular métricas baseadas nas transações
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();

      const transacoesMesAtual = transacoes?.filter(tx => {
        const dataTransacao = new Date(tx.data_transacao);
        return dataTransacao.getMonth() === mesAtual && dataTransacao.getFullYear() === anoAtual;
      }) || [];

      // Função para identificar receita operacional real
      const isRealRevenue = (transacao: any) => {
        const desc = transacao.descricao?.toLowerCase() || '';
        const categoria = transacao.categoria?.toLowerCase() || '';
        
        // Excluir estornos, reembolsos e créditos óbvios
        if (desc.includes('estorno') || desc.includes('reembolso') || desc.includes('crédito') || 
            desc.includes('refund') || desc.includes('devolução')) {
          return false;
        }
        
        // Incluir categorias que claramente são receita operacional
        const revenueCategories = [
          'pix recebido', 'boleto', 'transferência recebida', 'pagamento recebido',
          'venda', 'faturamento', 'recebimento'
        ];
        
        if (revenueCategories.some(cat => categoria.includes(cat) || desc.includes(cat))) {
          return true;
        }
        
        // Para valores maiores que R$ 100, considerar como receita real (assumindo que estornos são valores menores)
        if (transacao.valor >= 100) {
          return true;
        }
        
        return false;
      };

      const receitaMensal = transacoesMesAtual
        .filter(tx => tx.tipo === 'receita' && isRealRevenue(tx))
        .reduce((sum, tx) => sum + tx.valor, 0);

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

      const metricsResult = {
        saldoTotal,
        receitaMensal,
        despesasMensais,
        fluxoCaixa,
        runwayMeses,
        burnRate,
        ultimaAtualizacao,
        integracoesAtivas,
        alertaCritico
      };

      console.log('Métricas calculadas:', metricsResult);
      setMetrics(metricsResult);

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
