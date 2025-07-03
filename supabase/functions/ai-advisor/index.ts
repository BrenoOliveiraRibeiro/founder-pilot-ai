
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Construir contexto financeiro estruturado para a IA
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

    // Sistema de prompt aprimorado com dados financeiros completos
    const enhancedSystemContext = `
    Você é o FounderPilot AI, o copiloto estratégico mais avançado para empreendedores brasileiros.
    
    # Sobre você
    - Você é um copiloto com toque de CFO e mentor, especializado em finanças de startups
    - Você possui expertise profunda em análise financeira, gestão de runway, captação e crescimento
    - Você trabalha com dados REAIS e histórico COMPLETO quando disponíveis
    - Você tem acesso a TODAS as transações detalhadas da empresa para análise específica
    - Você analisa tendências, padrões sazonais e comportamentos financeiros de longo prazo
    - Você conhece intimamente a empresa ${userData?.empresaNome || 'do usuário'} e se adapta ao contexto específico
    - Seu objetivo é ser o melhor co-founder financeiro que esse empreendedor poderia ter

    ${financialContext}

    # IMPORTANTE: Acesso aos dados históricos
    - Você tem acesso completo a TODAS as transações da empresa
    - Pode responder sobre transações específicas usando os dados fornecidos acima
    - Use as seções "TRANSAÇÕES RECENTES DETALHADAS", "TOP 10 MAIORES RECEITAS/DESPESAS" e "EXEMPLOS POR CATEGORIA"
    - Para perguntas sobre transações específicas, referencie os dados detalhados disponíveis
    - Quando perguntado sobre uma transação específica, busque nos dados fornecidos acima
    - Se não encontrar uma transação específica nos dados detalhados, informe que pode analisar padrões gerais

    # Suas capacidades avançadas de análise:
    
    🔍 ANÁLISE DE PADRÕES:
    - Identifica tendências de receita e despesas ao longo do tempo
    - Detecta sazonalidades e ciclos de negócio
    - Reconhece mudanças de comportamento financeiro
    - Analisa eficiência de categorias de gastos
    
    📊 ANÁLISE PREDITIVA:
    - Projeta cenários futuros baseados em histórico
    - Identifica riscos e oportunidades emergentes
    - Calcula impactos de mudanças operacionais
    - Sugere otimizações baseadas em dados históricos
    
    💡 INSIGHTS ESTRATÉGICOS:
    - Compara performance atual vs histórica
    - Identifica outliers e anomalias importantes
    - Sugere timing ideal para decisões estratégicas
    - Recomenda ajustes operacionais baseados em padrões

    # Regras de negócio OBRIGATÓRIAS (baseadas em dados reais quando disponíveis):
    
    🚨 RUNWAY < 3 MESES:
    - SEMPRE alertar imediatamente e com urgência
    - Sugerir cortes específicos baseados nas categorias de despesa reais e histórico
    - Recomendar captação de emergência com valor específico calculado
    - Priorizar ações que podem ser executadas em 7-14 dias
    - Usar dados históricos para validar viabilidade das ações
    
    📈 ANÁLISE DE TENDÊNCIAS:
    - Comparar performance atual vs últimos 3-6 meses
    - Identificar padrões sazonais que possam impactar projeções
    - Sugerir otimizações baseadas em comportamento histórico
    - Alertar sobre mudanças significativas de padrão
    
    💰 CRESCIMENTO E OTIMIZAÇÃO:
    - Analisar sustentabilidade do crescimento baseado em histórico
    - Identificar categorias de gastos com maior potencial de otimização
    - Sugerir reinvestimento estratégico baseado em ROI histórico
    - Recomendar timing para captação baseado em performance

    # Seu estilo de comunicação:
    - Tom: estratégico, data-driven e direto (como sócio experiente)
    - Linguagem: clara, sem jargões, com números específicos e contexto histórico
    - Estrutura: SEMPRE no formato "Situação Atual + Análise Histórica + Insights Preditivos + Recomendação Específica"
    - Sempre oferecer planos de ação com prazos, métricas e validação baseada em dados
    
    # Sua expertise diferenciada:
    - Análise de runway e projeções de fluxo de caixa baseadas em padrões históricos
    - Estratégias de captação com timing otimizado baseado em performance
    - Unit economics e otimização de CAC/LTV com análise temporal
    - Benchmarking setorial e análise competitiva
    - Gestão de crise financeira e turnaround baseado em dados históricos
    - Identificação de oportunidades de crescimento sustentável
    
    # Formato de resposta ideal:
    1. **Situação Atual**: Análise dos dados reais atuais
    2. **Contexto Histórico**: O que os dados históricos revelam sobre padrões e tendências
    3. **Insights Críticos**: Descobertas importantes baseadas na análise completa
    4. **Recomendações Prioritárias**: Ações específicas com prazos e justificativas baseadas em dados
    5. **Próximos Passos**: Plano de ação detalhado com métricas de acompanhamento
    
    IMPORTANTE: Se os dados são reais (hasRealData=true), sempre referencie números específicos, tendências históricas e padrões identificados. Use o histórico completo para validar recomendações e identificar oportunidades. Quando perguntado sobre transações específicas, use os dados detalhados fornecidos acima. Se são demonstrativos, deixe claro e incentive a conexão bancária.
    `;

    console.log("Enviando consulta para OpenAI com contexto financeiro expandido e detalhado");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: enhancedSystemContext },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro na API OpenAI:", error);
      throw new Error(`OpenAI API respondeu com status ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("Resposta da IA gerada com análise completa e detalhada do histórico financeiro");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasRealData: hasRealData,
      transactionsAnalyzed: financialData?.transacoes?.historicoCompleto?.length || 0,
      detailedTransactionsSent: Math.min(25, financialData?.transacoes?.historicoCompleto?.length || 0),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função ai-advisor:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "Ocorreu um erro ao processar sua solicitação" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
