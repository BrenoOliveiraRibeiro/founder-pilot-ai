
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface JobRequest {
  jobType: 'sync_transactions' | 'calculate_metrics' | 'generate_insights' | 'update_runway';
  empresaId: string;
  priority: 'low' | 'medium' | 'high';
  payload?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { jobType, empresaId, priority, payload }: JobRequest = await req.json();

    console.log(`Processing background job: ${jobType} for empresa ${empresaId}`);

    let result;
    
    switch (jobType) {
      case 'sync_transactions':
        result = await syncTransactions(empresaId, payload, supabase);
        break;
        
      case 'calculate_metrics':
        result = await calculateMetrics(empresaId, supabase);
        break;
        
      case 'generate_insights':
        result = await generateInsights(empresaId, supabase);
        break;
        
      case 'update_runway':
        result = await updateRunwayProjections(empresaId, supabase);
        break;
        
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        jobType,
        result,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Background job error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});

async function syncTransactions(empresaId: string, payload: any, supabase: any) {
  console.log(`Syncing transactions for empresa ${empresaId}`);
  
  // Call the open-finance function to sync data
  const { data, error } = await supabase.functions.invoke('open-finance', {
    body: {
      action: 'sync_data',
      empresa_id: empresaId,
      sandbox: payload?.sandbox || true
    }
  });

  if (error) {
    throw new Error(`Failed to sync transactions: ${error.message}`);
  }

  return {
    action: 'sync_transactions',
    newTransactions: data?.newTransactions || 0,
    duplicates: data?.duplicates || 0,
    message: data?.message || 'Sync completed'
  };
}

async function calculateMetrics(empresaId: string, supabase: any) {
  console.log(`Calculating metrics for empresa ${empresaId}`);
  
  // Get transactions from last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  const { data: transacoes, error: txError } = await supabase
    .from('transacoes')
    .select('*')
    .eq('empresa_id', empresaId)
    .gte('data_transacao', threeMonthsAgo.toISOString().split('T')[0]);

  if (txError) {
    throw new Error(`Failed to fetch transactions: ${txError.message}`);
  }

  // Calculate metrics
  const receitas = transacoes?.filter(tx => tx.tipo === 'receita') || [];
  const despesas = transacoes?.filter(tx => tx.tipo === 'despesa') || [];
  
  const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(tx.valor), 0) / 3;
  const burnRate = Math.abs(despesas.reduce((total, tx) => total + tx.valor, 0)) / 3;
  
  // Get current cash from integrations
  const { data: integracoes } = await supabase
    .from('integracoes_bancarias')
    .select('account_data')
    .eq('empresa_id', empresaId)
    .eq('status', 'ativo');

  let caixaAtual = 0;
  if (integracoes) {
    for (const integracao of integracoes) {
      if (integracao.account_data?.results) {
        caixaAtual += integracao.account_data.results.reduce((sum: number, account: any) => {
          return sum + (account.balance || 0);
        }, 0);
      }
    }
  }

  const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
  const cashFlow = receitaMensal - burnRate;

  // Update metrics table
  const { error: metricError } = await supabase
    .from('metricas')
    .upsert({
      empresa_id: empresaId,
      data_referencia: new Date().toISOString().split('T')[0],
      caixa_atual: caixaAtual,
      receita_mensal: receitaMensal,
      burn_rate: burnRate,
      runway_meses: runwayMeses,
      cash_flow: cashFlow,
      mrr_growth: 0
    }, {
      onConflict: 'empresa_id,data_referencia'
    });

  if (metricError) {
    throw new Error(`Failed to update metrics: ${metricError.message}`);
  }

  return {
    action: 'calculate_metrics',
    metrics: {
      caixaAtual,
      receitaMensal,
      burnRate,
      runwayMeses,
      cashFlow
    }
  };
}

async function generateInsights(empresaId: string, supabase: any) {
  console.log(`Generating insights for empresa ${empresaId}`);
  
  // Get latest metrics
  const { data: metrics, error: metricsError } = await supabase
    .from('metricas')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('data_referencia', { ascending: false })
    .limit(1)
    .single();

  if (metricsError || !metrics) {
    throw new Error('No metrics found to generate insights');
  }

  const insights = [];

  // Critical runway alert
  if (metrics.runway_meses < 3) {
    insights.push({
      empresa_id: empresaId,
      tipo: 'Alerta',
      titulo: 'Runway Crítico',
      descricao: `Seu runway atual é de apenas ${metrics.runway_meses.toFixed(1)} meses. É urgente reduzir despesas ou aumentar receita.`,
      prioridade: 'alta',
      status: 'pendente'
    });
  }

  // Burn rate analysis
  if (metrics.burn_rate > metrics.receita_mensal * 1.5) {
    insights.push({
      empresa_id: empresaId,
      tipo: 'Recomendação',
      titulo: 'Burn Rate Elevado',
      descricao: `Seu burn rate (R$ ${metrics.burn_rate.toLocaleString()}) está muito alto em relação à receita. Considere otimizar custos.`,
      prioridade: 'media',
      status: 'pendente'
    });
  }

  // Positive cash flow
  if (metrics.cash_flow > 0) {
    insights.push({
      empresa_id: empresaId,
      tipo: 'Sucesso',
      titulo: 'Cash Flow Positivo',
      descricao: `Parabéns! Seu cash flow está positivo em R$ ${metrics.cash_flow.toLocaleString()}. Considere investir em crescimento.`,
      prioridade: 'baixa',
      status: 'pendente'
    });
  }

  // Insert insights
  if (insights.length > 0) {
    const { error: insightsError } = await supabase
      .from('insights')
      .insert(insights);

    if (insightsError) {
      throw new Error(`Failed to insert insights: ${insightsError.message}`);
    }
  }

  return {
    action: 'generate_insights',
    generatedInsights: insights.length,
    insights: insights.map(i => i.titulo)
  };
}

async function updateRunwayProjections(empresaId: string, supabase: any) {
  console.log(`Updating runway projections for empresa ${empresaId}`);
  
  // Get current metrics
  const { data: metrics } = await supabase
    .from('metricas')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('data_referencia', { ascending: false })
    .limit(1)
    .single();

  if (!metrics) {
    throw new Error('No metrics found for runway calculation');
  }

  // Calculate 12-month projection
  const projections = [];
  let remainingCash = metrics.caixa_atual;
  const monthlyBurn = metrics.burn_rate;
  
  for (let i = 0; i < 12; i++) {
    const projectionDate = new Date();
    projectionDate.setMonth(projectionDate.getMonth() + i);
    
    projections.push({
      month: projectionDate.toISOString().slice(0, 7), // YYYY-MM format
      cash: Math.max(0, remainingCash),
      burnRate: monthlyBurn,
      daysRemaining: remainingCash > 0 ? Math.floor((remainingCash / monthlyBurn) * 30) : 0
    });
    
    remainingCash -= monthlyBurn;
    
    if (remainingCash <= 0) break;
  }

  return {
    action: 'update_runway',
    projections: projections.length,
    runwayMonths: metrics.runway_meses,
    criticalDate: projections.find(p => p.cash <= 0)?.month || 'Beyond 12 months'
  };
}
