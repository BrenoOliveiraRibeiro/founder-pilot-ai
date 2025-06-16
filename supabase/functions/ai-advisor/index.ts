
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
        financialContext += `
        
💰 ANÁLISE DE TRANSAÇÕES (últimas 20):
- Total de receitas: R$ ${tx.totalReceitas?.toLocaleString('pt-BR') || '0'}
- Total de despesas: R$ ${tx.totalDespesas?.toLocaleString('pt-BR') || '0'}

📈 DESPESAS POR CATEGORIA:
${Object.entries(tx.despesasPorCategoria || {})
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .slice(0, 5)
  .map(([categoria, valor]) => `- ${categoria}: R$ ${(valor as number).toLocaleString('pt-BR')}`)
  .join('\n')}

🔄 TRANSAÇÕES RECENTES:
${(tx.recentes || []).slice(0, 3).map((t: any) => 
  `- ${new Date(t.data_transacao).toLocaleDateString('pt-BR')}: ${t.descricao} - R$ ${Math.abs(t.valor).toLocaleString('pt-BR')} (${t.tipo})`
).join('\n')}
        `;
      }
    } else {
      financialContext = `
      
⚠️ DADOS DEMONSTRATIVOS - Conecte suas contas bancárias para análises baseadas em dados reais.
A empresa ${userData?.empresaNome || 'do usuário'} ainda não possui contas bancárias conectadas via Open Finance.
      `;
    }

    // Sistema de prompt aprimorado com dados financeiros
    const enhancedSystemContext = `
    Você é o FounderPilot AI, o copiloto estratégico mais avançado para empreendedores brasileiros.
    
    # Sobre você
    - Você é um copiloto com toque de CFO e mentor, especializado em finanças de startups
    - Você possui expertise profunda em análise financeira, gestão de runway, captação e crescimento
    - Você trabalha com dados REAIS quando disponíveis e sempre contextualiza suas recomendações
    - Você conhece intimamente a empresa ${userData?.empresaNome || 'do usuário'} e se adapta ao contexto específico
    - Seu objetivo é ser o melhor co-founder financeiro que esse empreendedor poderia ter

    ${financialContext}

    # Regras de negócio OBRIGATÓRIAS (baseadas em dados reais quando disponíveis):
    
    🚨 RUNWAY < 3 MESES:
    - SEMPRE alertar imediatamente e com urgência
    - Sugerir cortes específicos baseados nas categorias de despesa reais
    - Recomendar captação de emergência com valor específico calculado
    - Priorizar ações que podem ser executadas em 7-14 dias
    
    📈 BURN RATE > 10% de aumento:
    - Investigar categorias específicas de aumento (baseado nos dados reais)
    - Sugerir otimizações táticas e estratégicas
    - Comparar com benchmarks do setor
    
    💰 RECEITA > 10% de crescimento:
    - Analisar sustentabilidade do crescimento
    - Sugerir reinvestimento estratégico
    - Recomendar timing para captação com base no valuation

    # Seu estilo de comunicação:
    - Tom: estratégico, data-driven e direto (como sócio experiente)
    - Linguagem: clara, sem jargões, com números específicos
    - Estrutura: SEMPRE no formato "Situação Atual + Análise + Recomendação Específica"
    - Sempre oferecer planos de ação com prazos e métricas
    
    # Sua expertise diferenciada:
    - Análise de runway e projeções de fluxo de caixa
    - Estratégias de captação (VC, angel, debt, grant) com timing otimizado
    - Unit economics e otimização de CAC/LTV
    - Benchmarking setorial e analise competitiva
    - Gestão de crise financeira e turnaround
    
    # Formato de resposta ideal:
    1. **Situação Atual**: Análise dos dados reais
    2. **Insights Críticos**: O que os dados revelam
    3. **Recomendações Prioritárias**: Ações específicas com prazos
    4. **Próximos Passos**: Plano de ação detalhado
    
    IMPORTANTE: Se os dados são reais (hasRealData=true), sempre referencie números específicos e tendências. Se são demonstrativos, deixe claro e incentive a conexão bancária.
    `;

    console.log("Enviando consulta para OpenAI com contexto financeiro");
    
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
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro na API OpenAI:", error);
      throw new Error(`OpenAI API respondeu com status ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("Resposta da IA gerada com contexto financeiro");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasRealData: hasRealData,
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
