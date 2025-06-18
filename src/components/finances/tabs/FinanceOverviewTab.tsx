import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";

interface MetricasData {
  caixa_atual: number;
  receita_mensal: number;
  burn_rate: number;
  runway_meses: number;
  cash_flow: number;
  mrr_growth: number;
}

interface FinanceOverviewTabProps {
  selectedDate?: Date;
}

export const FinanceOverviewTab: React.FC<FinanceOverviewTabProps> = ({ selectedDate }) => {
  const { currentEmpresa } = useAuth();
  const [metricas, setMetricas] = useState<MetricasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Usar o hook de métricas de transações para o resumo financeiro
  const {
    saldoCaixa,
    entradasMesAtual,
    saidasMesAtual,
    fluxoCaixaMesAtual,
    loading: transactionsLoading
  } = useTransactionsMetrics({ selectedDate });

  // Gerar string do mês/ano baseado na data selecionada
  const mesAno = selectedDate ? 
    selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) :
    new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchMetricas = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar métricas mais recentes da empresa
        const { data: metricasData, error } = await supabase
          .from('metricas')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .order('data_referencia', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (metricasData) {
          setMetricas({
            caixa_atual: metricasData.caixa_atual || 0,
            receita_mensal: metricasData.receita_mensal || 0,
            burn_rate: metricasData.burn_rate || 0,
            runway_meses: metricasData.runway_meses || 0,
            cash_flow: metricasData.cash_flow || 0,
            mrr_growth: metricasData.mrr_growth || 0
          });
        } else {
          // Se não há métricas, calcular com base nas transações
          await calcularMetricasFromTransacoes();
        }
      } catch (error: any) {
        console.error('Erro ao buscar métricas:', error);
        setError(error.message || 'Erro ao carregar métricas');
      } finally {
        setLoading(false);
      }
    };

    const calcularMetricasFromTransacoes = async () => {
      try {
        // Buscar transações dos últimos 3 meses
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const { data: transacoes, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa!.id)
          .gte('data_transacao', threeMonthsAgo.toISOString().split('T')[0]);

        if (error) throw error;

        if (transacoes && transacoes.length > 0) {
          const receitas = transacoes.filter(tx => tx.tipo === 'receita' && tx.valor > 0);
          const despesas = transacoes.filter(tx => tx.tipo === 'despesa' && tx.valor < 0);
          
          const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(tx.valor), 0) / 3;
          const burnRate = Math.abs(despesas.reduce((total, tx) => total + tx.valor, 0)) / 3;
          const cashFlow = receitaMensal - burnRate;
          
          // Buscar saldo atual das contas bancárias
          const { data: integracoes } = await supabase
            .from('integracoes_bancarias')
            .select('*')
            .eq('empresa_id', currentEmpresa!.id)
            .eq('status', 'ativo');

          let caixaAtual = 0;
          if (integracoes) {
            caixaAtual = integracoes.reduce((total, integracao) => {
              // Type check for account_data
              if (integracao.account_data && typeof integracao.account_data === 'object' && integracao.account_data !== null) {
                const accountData = integracao.account_data as any;
                if (accountData.results && Array.isArray(accountData.results)) {
                  return total + accountData.results.reduce((sum: number, account: any) => {
                    return sum + (account.balance || 0);
                  }, 0);
                }
              }
              return total;
            }, 0);
          }

          const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;

          setMetricas({
            caixa_atual: caixaAtual,
            receita_mensal: receitaMensal,
            burn_rate: burnRate,
            runway_meses: runwayMeses,
            cash_flow: cashFlow,
            mrr_growth: 0
          });
        } else {
          setMetricas({
            caixa_atual: 0,
            receita_mensal: 0,
            burn_rate: 0,
            runway_meses: 0,
            cash_flow: 0,
            mrr_growth: 0
          });
        }
      } catch (error: any) {
        console.error('Erro ao calcular métricas:', error);
        setError(error.message || 'Erro ao calcular métricas');
      }
    };

    fetchMetricas();
  }, [currentEmpresa?.id]);

  const getRunwayColor = (runway: number) => {
    if (runway < 3) return 'text-red-500';
    if (runway < 6) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRunwayBgColor = (runway: number) => {
    if (runway < 3) return 'bg-red-500';
    if (runway < 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const calculateHealthMetrics = () => {
    if (!metricas) return [];

    const margemBruta = metricas.receita_mensal > 0 ? 
      ((metricas.receita_mensal - metricas.burn_rate) / metricas.receita_mensal) * 100 : 0;
    
    const margemLiquida = metricas.receita_mensal > 0 ? 
      (metricas.cash_flow / metricas.receita_mensal) * 100 : 0;
    
    const eficienciaCapital = metricas.burn_rate > 0 ? 
      metricas.receita_mensal / metricas.burn_rate : 0;
    
    const burnMultiple = metricas.receita_mensal > 0 ? 
      metricas.burn_rate / metricas.receita_mensal : 0;

    return [
      { 
        title: "Margem Bruta", 
        value: `${margemBruta.toFixed(1)}%`, 
        status: margemBruta > 50 ? "good" : margemBruta > 30 ? "warning" : "bad", 
        target: ">50%" 
      },
      { 
        title: "Margem Líquida", 
        value: `${margemLiquida.toFixed(1)}%`, 
        status: margemLiquida > 20 ? "good" : margemLiquida > 10 ? "warning" : "bad", 
        target: ">20%" 
      },
      { 
        title: "Eficiência de Capital", 
        value: `${eficienciaCapital.toFixed(1)}x`, 
        status: eficienciaCapital > 1.5 ? "good" : eficienciaCapital > 1 ? "warning" : "bad", 
        target: ">1.5x" 
      },
      { 
        title: "Burn Multiple", 
        value: `${burnMultiple.toFixed(1)}x`, 
        status: burnMultiple < 1.5 ? "good" : burnMultiple < 2 ? "warning" : "bad", 
        target: "<1.5x" 
      }
    ];
  };

  if (loading || transactionsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
            <CardDescription>Visão geral das finanças da empresa para o período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saúde Financeira</CardTitle>
            <CardDescription>Indicadores de saúde financeira da empresa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center">
                  <Skeleton className="w-3 h-3 rounded-full mr-3" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Erro ao carregar dados</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metricas) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex items-center justify-center h-48">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum dado disponível</h3>
              <p className="text-sm text-muted-foreground">
                Conecte suas contas bancárias para ver métricas financeiras
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthMetrics = calculateHealthMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro - {mesAno}</CardTitle>
          <CardDescription>
            Visão geral das finanças da empresa para o período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-2/3"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Posição Financeira</h3>
                <p className="text-sm text-muted-foreground mb-1">Saldo em Caixa</p>
                <p className="text-2xl font-bold">{formatCurrency(saldoCaixa)}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Movimento do Mês</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Entradas:</span>
                    <span className="text-green-600 font-medium">{formatCurrency(entradasMesAtual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saídas:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(saidasMesAtual)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Resultado:</span>
                    <span className={`font-bold ${fluxoCaixaMesAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(fluxoCaixaMesAtual)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saúde Financeira</CardTitle>
          <CardDescription>Indicadores de saúde financeira da empresa baseados em dados reais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  metric.status === 'good' ? 'bg-green-500' : 
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{metric.title}</span>
                    <span className="font-bold">{metric.value}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>Meta: {metric.target}</span>
                    <span>{metric.status === 'good' ? 'Bom' : metric.status === 'warning' ? 'Atenção' : 'Crítico'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              * Métricas calculadas com base em dados reais dos últimos 3 meses
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
