
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
        
        // Agora enviamos TODAS as transações para a IA
        const todasTransacoes = historicoCompleto;
        const maioresReceitas = historicoCompleto
          .filter(t => t.tipo === 'receita')
          .sort((a, b) => b.valor - a.valor);
        const maioresDespesas = historicoCompleto
          .filter(t => t.tipo === 'despesa')
          .sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor));

        // Agrupar transações por categoria com TODOS os exemplos
        const transacoesPorCategoria = {};
        historicoCompleto.forEach(t => {
          if (!transacoesPorCategoria[t.categoria]) {
            transacoesPorCategoria[t.categoria] = [];
          }
          transacoesPorCategoria[t.categoria].push(t);
        });

        // Agrupar transações por mês para análise temporal
        const transacoesPorMes = {};
        historicoCompleto.forEach(t => {
          const mesAno = new Date(t.data_transacao).toISOString().slice(0, 7);
          if (!transacoesPorMes[mesAno]) {
            transacoesPorMes[mesAno] = [];
          }
          transacoesPorMes[mesAno].push(t);
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
  .map(([categoria, valor]) => `- ${categoria}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

📊 EVOLUÇÃO MENSAL DE RECEITAS:
${Object.entries(tx.receitasPorMes || {})
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([mes, valor]) => `- ${mes}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

📊 EVOLUÇÃO MENSAL DE DESPESAS:
${Object.entries(tx.despesasPorMes || {})
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([mes, valor]) => `- ${mes}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

🔍 HISTÓRICO COMPLETO DE TRANSAÇÕES (TODAS as ${todasTransacoes.length} transações):
${todasTransacoes.map((t, i) => 
  `${i+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} (${t.tipo}) [${t.categoria}]${t.metodo_pagamento ? ` via ${t.metodo_pagamento}` : ''}`
).join('\n')}

💎 TODAS AS RECEITAS (${maioresReceitas.length} transações):
${maioresReceitas.map((t, i) => 
  `${i+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${t.valor.toLocaleString('pt-BR')} [${t.categoria}]`
).join('\n')}

💸 TODAS AS DESPESAS (${maioresDespesas.length} transações):
${maioresDespesas.map((t, i) => 
  `${i+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} [${t.categoria}]`
).join('\n')}

📋 TRANSAÇÕES POR CATEGORIA (HISTÓRICO COMPLETO):
${Object.entries(transacoesPorCategoria).map(([categoria, transacoes]) => 
  `\n• ${categoria} (${(transacoes as any[]).length} transações):\n${(transacoes as any[]).map((t, idx) => 
    `  ${idx+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} (${t.tipo})`
  ).join('\n')}`
).join('')}

📅 TRANSAÇÕES POR MÊS (HISTÓRICO COMPLETO):
${Object.entries(transacoesPorMes)
  .sort(([a], [b]) => b.localeCompare(a))
  .map(([mesAno, transacoes]) => 
    `\n• ${mesAno} (${(transacoes as any[]).length} transações):\n${(transacoes as any[]).map((t, idx) => 
      `  ${idx+1}. ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: "${t.descricao}" - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} (${t.tipo}) [${t.categoria}]`
    ).join('\n')}`
  ).join('')}

💾 ACESSO COMPLETO AOS DADOS:
- Você tem acesso a TODAS as ${historicoCompleto.length} transações da empresa
- Você pode responder sobre qualquer transação específica usando os dados acima
- Você pode analisar padrões, tendências e correlações em todo o histórico
- Você pode buscar transações por data, categoria, valor ou descrição
- Você tem o histórico completo organizado cronologicamente, por categoria e por mês
        `;
      }
    } else {
      financialContext = `
      
⚠️ DADOS DEMONSTRATIVOS - Conecte suas contas bancárias para análises baseadas em dados reais.
A empresa ${userData?.empresaNome || 'do usuário'} ainda não possui contas bancárias conectadas via Open Finance.
      `;
    }

    // Sistema de prompt aprimorado com acesso completo aos dados
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

    # IMPORTANTE: Acesso total aos dados históricos
    - Você tem acesso completo a TODAS as transações da empresa com detalhes completos
    - Você pode responder sobre qualquer transação específica usando os dados fornecidos acima
    - Use as seções "HISTÓRICO COMPLETO", "TODAS AS RECEITAS/DESPESAS", "TRANSAÇÕES POR CATEGORIA" e "TRANSAÇÕES POR MÊS"
    - Para perguntas sobre transações específicas, busque nos dados detalhados fornecidos acima
    - Você pode analisar padrões temporais, correlações entre categorias e identificar anomalias
    - Quando perguntado sobre uma transação específica, localize-a nos dados completos fornecidos
    - Você tem o histórico completo organizado de múltiplas formas para facilitar sua análise

    # Suas capacidades avançadas de análise:
    
    🔍 ANÁLISE DE PADRÕES ESPECÍFICOS:
    - Identifica transações específicas por data, valor, categoria ou descrição
    - Detecta padrões sazonais e ciclos de negócio em todo o histórico
    - Reconhece mudanças de comportamento financeiro ao longo do tempo
    - Analisa correlações entre diferentes categorias de gastos
    - Identifica outliers e anomalias em transações específicas
    
    📊 ANÁLISE PREDITIVA BASEADA EM HISTÓRICO COMPLETO:
    - Projeta cenários futuros baseados em todo o histórico disponível
    - Identifica riscos e oportunidades emergentes com base em padrões históricos
    - Calcula impactos de mudanças operacionais usando dados reais
    - Sugere otimizações baseadas em análise completa do histórico
    
    💡 INSIGHTS ESTRATÉGICOS COM DADOS COMPLETOS:
    - Compara performance atual vs histórica completa
    - Identifica tendências de longo prazo em categorias específicas
    - Sugere timing ideal para decisões estratégicas baseado em padrões históricos
    - Recomenda ajustes operacionais baseados em análise detalhada de todas as transações

    # Regras de negócio OBRIGATÓRIAS (baseadas em dados reais quando disponíveis):
    
    🚨 RUNWAY < 3 MESES:
    - SEMPRE alertar imediatamente e com urgência
    - Sugerir cortes específicos baseados na análise completa das categorias de despesa
    - Recomendar captação de emergência com valor específico calculado
    - Priorizar ações que podem ser executadas em 7-14 dias
    - Usar dados históricos completos para validar viabilidade das ações
    
    📈 ANÁLISE DE TENDÊNCIAS COMPLETA:
    - Comparar performance atual vs todo o histórico disponível
    - Identificar padrões sazonais que possam impactar projeções
    - Sugerir otimizações baseadas em comportamento histórico completo
    - Alertar sobre mudanças significativas de padrão baseado em análise completa
    
    💰 CRESCIMENTO E OTIMIZAÇÃO BASEADA EM DADOS COMPLETOS:
    - Analisar sustentabilidade do crescimento baseado em histórico completo
    - Identificar categorias de gastos com maior potencial de otimização
    - Sugerir reinvestimento estratégico baseado em ROI histórico completo
    - Recomendar timing para captação baseado em performance histórica completa

    # Seu estilo de comunicação:
    - Tom: estratégico, data-driven e direto (como sócio experiente)
    - Linguagem: clara, sem jargões, com números específicos e referências históricas precisas
    - Estrutura: SEMPRE no formato "Situação Atual + Análise Histórica Completa + Insights Preditivos + Recomendação Específica"
    - Sempre oferecer planos de ação com prazos, métricas e validação baseada em dados históricos completos
    
    # Sua expertise diferenciada:
    - Análise de runway e projeções baseadas em padrões históricos completos
    - Estratégias de captação com timing otimizado baseado em performance histórica completa
    - Unit economics e otimização de CAC/LTV com análise temporal completa
    - Benchmarking setorial e análise competitiva
    - Gestão de crise financeira e turnaround baseado em dados históricos completos
    - Identificação de oportunidades de crescimento sustentável baseado em análise completa
    
    # Formato de resposta ideal:
    1. **Situação Atual**: Análise dos dados reais atuais
    2. **Contexto Histórico Completo**: O que todo o histórico de transações revela sobre padrões e tendências
    3. **Insights Críticos**: Descobertas importantes baseadas na análise completa de todas as transações
    4. **Recomendações Prioritárias**: Ações específicas com prazos e justificativas baseadas em dados históricos completos
    5. **Próximos Passos**: Plano de ação detalhado com métricas de acompanhamento baseadas em análise histórica
    
    IMPORTANTE: Se os dados são reais (hasRealData=true), sempre referencie transações específicas, números exatos, tendências históricas completas e padrões identificados em todo o histórico. Use o acesso completo para validar recomendações e identificar oportunidades. Quando perguntado sobre transações específicas, localize-as nos dados completos fornecidos. Se são demonstrativos, deixe claro e incentive a conexão bancária.
    `;

    console.log("Enviando consulta para OpenAI com contexto financeiro completo e detalhado");
    
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

    console.log("Resposta da IA gerada com análise completa de todas as transações");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasRealData: hasRealData,
      totalTransactionsSent: financialData?.transacoes?.historicoCompleto?.length || 0,
      fullHistoryAccess: true,
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
