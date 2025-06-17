
import { supabase } from '@/integrations/supabase/client';

export interface OpenFinanceMetrics {
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

export class OpenFinanceService {
  static async getMetrics(empresaId: string): Promise<OpenFinanceMetrics> {
    // Buscar integrações ativas
    const { data: integracoes, error: integracoesError } = await supabase
      .from('integracoes_bancarias')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('status', 'ativo')
      .eq('tipo_conexao', 'Open Finance');

    if (integracoesError) throw integracoesError;

    const integracoesAtivas = integracoes?.length || 0;

    if (integracoesAtivas === 0) {
      return {
        saldoTotal: 0,
        receitaMensal: 0,
        despesasMensais: 0,
        fluxoCaixa: 0,
        runwayMeses: 0,
        burnRate: 0,
        ultimaAtualizacao: null,
        integracoesAtivas: 0,
        alertaCritico: false
      };
    }

    // Calcular saldo total das contas conectadas
    let saldoTotal = 0;
    let ultimaAtualizacao: string | null = null;

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

    const transactionMetrics = await this.calculateTransactionMetrics(empresaId);
    const runwayMeses = transactionMetrics.burnRate > 0 ? saldoTotal / transactionMetrics.burnRate : 0;
    const alertaCritico = runwayMeses < 3;

    return {
      saldoTotal,
      receitaMensal: transactionMetrics.receitaMensal,
      despesasMensais: transactionMetrics.despesasMensais,
      fluxoCaixa: transactionMetrics.fluxoCaixa,
      runwayMeses,
      burnRate: transactionMetrics.burnRate,
      ultimaAtualizacao,
      integracoesAtivas,
      alertaCritico
    };
  }

  private static async calculateTransactionMetrics(empresaId: string) {
    // Buscar transações dos últimos 3 meses para calcular métricas
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transacoes, error: transacoesError } = await supabase
      .from('transacoes')
      .select('*')
      .eq('empresa_id', empresaId)
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

    return {
      receitaMensal,
      despesasMensais,
      fluxoCaixa,
      burnRate
    };
  }
}
