
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface MetricasData {
  caixa_atual: number;
  receita_mensal: number;
  burn_rate: number;
  runway_meses: number;
  cash_flow: number;
  mrr_growth: number;
}

export const FinanceOverviewTab: React.FC = () => {
  const { currentEmpresa } = useAuth();
  const [metricas, setMetricas] = useState<MetricasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              if (integracao.account_data?.results) {
                return total + integracao.account_data.results.reduce((sum: number, account: any) => {
                  return sum + (account.balance || 0);
                }, 0);
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Runway</CardTitle>
            <CardDescription>Com base no burn rate atual, seu dinheiro dura:</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <Skeleton className="h-16 w-32 mb-4" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-2 w-full mb-4" />
              <Skeleton className="h-4 w-36" />
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
          <CardTitle>Runway</CardTitle>
          <CardDescription>
            Com base no burn rate atual, seu dinheiro dura:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <div className={`text-5xl font-bold mb-2 ${getRunwayColor(metricas.runway_meses)}`}>
              {metricas.runway_meses.toFixed(1)} meses
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Burn rate mensal médio: {formatCurrency(metricas.burn_rate)}
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mb-4">
              <div 
                className={`h-2.5 rounded-full ${getRunwayBgColor(metricas.runway_meses)}`}
                style={{ width: `${Math.min(metricas.runway_meses / 12 * 100, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-muted-foreground">
              Meta recomendada: 12+ meses
            </div>
            
            {/* Métricas adicionais */}
            <div className="mt-4 pt-4 border-t w-full">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Caixa Atual</div>
                  <div className="font-bold">{formatCurrency(metricas.caixa_atual)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Cash Flow</div>
                  <div className={`font-bold flex items-center justify-center ${
                    metricas.cash_flow >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {metricas.cash_flow >= 0 ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    {formatCurrency(Math.abs(metricas.cash_flow))}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
