
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userData, financialData, hasRealData } = await req.json();

    // Construir contexto financeiro estruturado para o webhook n8n
    let financialContext = "";
    
    if (hasRealData && financialData?.metrics) {
      const metrics = financialData.metrics;
      financialContext = `
      
DADOS FINANCEIROS REAIS DA EMPRESA ${userData?.empresaNome || 'do usuário'}:

📊 MÉTRICAS PRINCIPAIS:
- Saldo em caixa: R$ ${metrics.saldoTotal?.toLocaleString('pt-BR') || '0'}
- Receita mensal: R$ ${metrics.receitaMensal?.toLocaleString('pt-BR') || '0'}
- Despesas mensais: R$ ${metrics.despesasMensais?.toLocaleString('pt-BR') || '0'}
- Burn rate: R$ ${metrics.burnRate?.toLocaleString('pt-BR') || '0'}/mês
- Runway atual: ${metrics.runwayMeses?.toFixed(1) || '0'} meses
- Fluxo de caixa: R$ ${metrics.fluxoCaixa?.toLocaleString('pt-BR') || '0'}
- Contas conectadas: ${metrics.integracoesAtivas} (Open Finance)
- Última sincronização: ${metrics.ultimaAtualizacao ? new Date(metrics.ultimaAtualizacao).toLocaleString('pt-BR') : 'N/A'}

🚨 ALERTAS AUTOMÁTICOS:
${metrics.runwayMeses < 3 ? '- RUNWAY CRÍTICO: Menos de 3 meses de caixa!' : ''}
${metrics.burnRate > metrics.receitaMensal ? '- BURN RATE ALTO: Gastos excedem receita!' : ''}
${metrics.fluxoCaixa < 0 ? '- FLUXO NEGATIVO: Mais saídas que entradas este mês!' : ''}
      `;

      if (financialData.transacoes) {
        const tx = financialData.transacoes;
        const historicoCompleto = tx.historicoCompleto || [];
        
        // Preparar transações organizadas para análise detalhada
        const transacoesRecentes = historicoCompleto.slice(0, 25);
        const maioresReceitas = historicoCompleto
          .filter(t => t.tipo === 'receita')
          .sort((a, b) => b.valor - a.valor)
          .slice(0, 10);
        const maioresDespesas = historicoCompleto
          .filter(t => t.tipo === 'despesa')
          .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
          .slice(0, 10);

        // Agrupar transações por categoria com exemplos
        const exemplosPorCategoria = {};
        historicoCompleto.forEach(t => {
          if (!exemplosPorCategoria[t.categoria]) {
            exemplosPorCategoria[t.categoria] = [];
          }
          if (exemplosPorCategoria[t.categoria].length < 3) {
            exemplosPorCategoria[t.categoria].push(t);
          }
        });

        financialContext += `
        
💰 ANÁLISE COMPLETA DE TRANSAÇÕES (${historicoCompleto.length} transações):
- Total de receitas: R$ ${tx.totalReceitas?.toLocaleString('pt-BR') || '0'}
- Total de despesas: R$ ${tx.totalDespesas?.toLocaleString('pt-BR') || '0'}
- Período de análise: ${historicoCompleto.length > 0 ? 
  `${new Date(historicoCompleto[historicoCompleto.length - 1]?.data_transacao).toLocaleDateString('pt-BR')} até ${new Date(historicoCompleto[0]?.data_transacao).toLocaleDateString('pt-BR')}` 
  : 'N/A'}

📈 TENDÊNCIAS AVANÇADAS:
- Receita média (3 meses): R$ ${tx.tendencias?.receitaMedia3Meses?.toLocaleString('pt-BR') || '0'}
- Receita média (6 meses): R$ ${tx.tendencias?.receitaMedia6Meses?.toLocaleString('pt-BR') || '0'}
- Despesa média (3 meses): R$ ${tx.tendencias?.despesaMedia3Meses?.toLocaleString('pt-BR') || '0'}
- Tendência de receita: ${tx.tendencias?.crescimentoReceitaTendencia === 'crescimento' ? '📈 CRESCIMENTO' : '📉 DECLÍNIO'}

🔄 ANÁLISE DE RECORRÊNCIA:
- Receita recorrente: R$ ${tx.recorrencia?.receitaRecorrente?.toLocaleString('pt-BR') || '0'} (${tx.recorrencia?.percentualReceitaRecorrente?.toFixed(1) || '0'}%)
- Despesa recorrente: R$ ${tx.recorrencia?.despesaRecorrente?.toLocaleString('pt-BR') || '0'} (${tx.recorrencia?.percentualDespesaRecorrente?.toFixed(1) || '0'}%)

📈 DESPESAS POR CATEGORIA (análise completa):
${Object.entries(tx.despesasPorCategoria || {})
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 8)
  .map(([categoria, valor]) => `- ${categoria}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

📊 EVOLUÇÃO MENSAL DE RECEITAS:
${Object.entries(tx.receitasPorMes || {})
  .sort(([a], [b]) => b.localeCompare(a))
  .slice(0, 6)
  .map(([mes, valor]) => `- ${mes}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

📊 EVOLUÇÃO MENSAL DE DESPESAS:
${Object.entries(tx.despesasPorMes || {})
  .sort(([a], [b]) => b.localeCompare(a))
  .slice(0, 6)
  .map(([mes, valor]) => `- ${mes}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

🔍 TRANSAÇÕES RECENTES DETALHADAS (últimas 25):
${transacoesRecentes.map((t, i) => 
  `${i+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} (${t.tipo}) [${t.categoria}]${t.metodo_pagamento ? ` via ${t.metodo_pagamento}` : ''}`
).join('\n')}

💎 TOP 10 MAIORES RECEITAS:
${maioresReceitas.map((t, i) => 
  `${i+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${t.valor.toLocaleString('pt-BR')} [${t.categoria}]`
).join('\n')}

💸 TOP 10 MAIORES DESPESAS:
${maioresDespesas.map((t, i) => 
  `${i+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} [${t.categoria}]`
).join('\n')}

📋 EXEMPLOS POR CATEGORIA:
${Object.entries(exemplosPorCategoria).map(([categoria, transacoes]) => 
  `\n• ${categoria}:\n${(transacoes as any[]).map(t => 
    `  - ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')}`
  ).join('\n')}`
).join('')}

💾 DADOS HISTÓRICOS COMPLETOS DISPONÍVEIS:
- Total de transações analisadas: ${historicoCompleto.length}
- Período completo: ${historicoCompleto.length > 0 ? 
  `${new Date(historicoCompleto[historicoCompleto.length - 1]?.data_transacao).toLocaleDateString('pt-BR')} até ${new Date(historicoCompleto[0]?.data_transacao).toLocaleDateString('pt-BR')}` 
  : 'N/A'}
- Você tem acesso a TODAS as ${historicoCompleto.length} transações para análise detalhada
        `;
      }
    } else {
      financialContext = `
      
⚠️ DADOS DEMONSTRATIVOS - Conecte suas contas bancárias para análises baseadas em dados reais.
A empresa ${userData?.empresaNome || 'do usuário'} ainda não possui contas bancárias conectadas via Open Finance.
      `;
    }

    // Payload estruturado para enviar ao webhook n8n
    const webhookPayload = {
      message: message,
      userData: {
        empresaId: userData?.empresaId || null,
        empresaNome: userData?.empresaNome || null,
        userNome: userData?.userNome || null
      },
      financialData: financialData,
      financialContext: financialContext,
      hasRealData: hasRealData,
      timestamp: new Date().toISOString(),
      transactionsAnalyzed: financialData?.transacoes?.historicoCompleto?.length || 0,
      detailedTransactionsSent: Math.min(25, financialData?.transacoes?.historicoCompleto?.length || 0)
    };

    console.log("Enviando dados para webhook n8n:", {
      message: message,
      hasRealData: hasRealData,
      transactionsCount: webhookPayload.transactionsAnalyzed,
      empresa: userData?.empresaNome
    });
    
    // Enviar para o webhook n8n ao invés da OpenAI
    const response = await fetch('https://n8n.servidoremn.site/webhook-test/founderpilot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro no webhook n8n:", response.status, errorText);
      throw new Error(`Webhook n8n respondeu com status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Assumindo que o webhook n8n retorna uma estrutura com a resposta da IA
    // Adapte conforme a estrutura real retornada pelo seu webhook
    const aiResponse = data.response || data.message || data.content || "Resposta processada pelo n8n";

    console.log("Resposta recebida do webhook n8n e enviada para o frontend");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasRealData: hasRealData,
      transactionsAnalyzed: webhookPayload.transactionsAnalyzed,
      detailedTransactionsSent: webhookPayload.detailedTransactionsSent,
      timestamp: new Date().toISOString(),
      source: "n8n-webhook"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função ai-advisor:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Ocorreu um erro ao processar sua solicitação",
      source: "n8n-webhook"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
