
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY") || "";

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { 
      action, 
      empresa_id, 
      setor, 
      estagio, 
      segment, 
      region, 
      customerType,
      historic_data 
    } = requestData;

    if (action === "fetch_benchmarks") {
      console.log(`Buscando benchmarks para empresa ${empresa_id}, setor: ${setor}, estágio: ${estagio}`);
      
      // Em uma implementação real, você faria chamadas para as APIs do CrunchBase e PitchBook
      // Simulando dados de benchmark
      const benchmarkData = {
        burn_rate_medio: 42000,
        runway_medio: 12,
        funding_medio: 1500000,
        mrr_growth_medio: 15,
        headcount_medio: 18,
        cac_medio: 750,
        ltv_medio: 4500,
        empresas_similares: [
          { nome: "CompTech", valuation: 12000000, ultimo_aporte: "Series A" },
          { nome: "TechStart", valuation: 8000000, ultimo_aporte: "Seed" },
          { nome: "InnovateCo", valuation: 15000000, ultimo_aporte: "Series A" }
        ]
      };
      
      // Gerar insights com base nos dados
      const { data: empresaData } = await supabase
        .from("empresas")
        .select("*")
        .eq("id", empresa_id)
        .single();
        
      const { data: metricasData } = await supabase
        .from("metricas")
        .select("*")
        .eq("empresa_id", empresa_id)
        .order("data_referencia", { ascending: false })
        .limit(1)
        .single();
      
      if (metricasData) {
        // Comparar dados da empresa com benchmarks e gerar insights
        const insights = [];
        
        if (metricasData.burn_rate > benchmarkData.burn_rate_medio * 1.2) {
          insights.push({
            empresa_id,
            tipo: "alerta",
            titulo: `Seu burn rate está 20% acima da média de startups ${estagio} em ${setor}`,
            descricao: "Considere revisar despesas em marketing e infraestrutura para alinhar com benchmarks do setor.",
            prioridade: "alta"
          });
        }
        
        if (metricasData.runway_meses < 6 && metricasData.runway_meses < benchmarkData.runway_medio * 0.5) {
          insights.push({
            empresa_id,
            tipo: "alerta",
            titulo: `Seu runway está significativamente abaixo da média do mercado (${benchmarkData.runway_medio} meses)`,
            descricao: "Recomendamos iniciar conversas com investidores em breve para evitar problemas de caixa.",
            prioridade: "alta"
          });
        }
        
        if (metricasData.mrr_growth > benchmarkData.mrr_growth_medio * 1.5) {
          insights.push({
            empresa_id,
            tipo: "projeção",
            titulo: `Seu crescimento de MRR está 50% acima da média do mercado`,
            descricao: "Considere alavancar esse crescimento para captação em condições favoráveis.",
            prioridade: "media"
          });
        }
        
        // Salvar insights no banco de dados
        if (insights.length > 0) {
          const { error } = await supabase
            .from("insights")
            .insert(insights);
            
          if (error) {
            console.error("Erro ao salvar insights:", error);
          }
        }
      }
      
      return new Response(
        JSON.stringify({ success: true, data: benchmarkData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    if (action === "analyze_market_size") {
      console.log(`Analisando TAM/SAM/SOM para segmento: ${segment}, região: ${region}, tipo de cliente: ${customerType}`);
      
      // Buscar dados existentes da empresa
      let empresaData = null;
      let metricasRecentes = [];
      let transacoesRecentes = [];
      
      if (empresa_id) {
        const { data: empresa } = await supabase
          .from("empresas")
          .select("*")
          .eq("id", empresa_id)
          .maybeSingle();
          
        if (empresa) {
          empresaData = empresa;
          
          // Buscar métricas recentes
          const { data: metricas } = await supabase
            .from("metricas")
            .select("*")
            .eq("empresa_id", empresa_id)
            .order("data_referencia", { ascending: false })
            .limit(3);
            
          if (metricas) {
            metricasRecentes = metricas;
          }
          
          // Buscar transações recentes
          const { data: transacoes } = await supabase
            .from("transacoes")
            .select("*")
            .eq("empresa_id", empresa_id)
            .order("data_transacao", { ascending: false })
            .limit(50);
            
          if (transacoes) {
            transacoesRecentes = transacoes;
          }
        }
      }
      
      // Usar OpenAI para enriquecer os dados de mercado
      let aiEnrichedData = null;
      if (openaiApiKey) {
        try {
          // Preparar o prompt com dados existentes
          let prompt = `Analise o mercado de ${segment || "tecnologia"} `;
          if (region) prompt += `na região ${region} `;
          prompt += `para clientes ${customerType || "B2B"}. `;
          
          // Adicionar dados da empresa se disponíveis
          if (empresaData) {
            prompt += `A empresa está no estágio ${empresaData.estagio || "inicial"} `;
            prompt += `no segmento ${empresaData.segmento || segment || "tecnologia"} `;
            prompt += `com ${empresaData.num_funcionarios || "poucos"} funcionários. `;
          }
          
          // Adicionar dados de métricas se disponíveis
          if (metricasRecentes.length > 0) {
            const metricaRecente = metricasRecentes[0];
            prompt += `A empresa tem MRR de R$${metricaRecente.receita_mensal || 0}, `;
            prompt += `burn rate de R$${metricaRecente.burn_rate || 0} `;
            prompt += `e runway de ${metricaRecente.runway_meses || 0} meses. `;
          }
          
          // Adicionar informações sobre transações recentes se disponíveis
          if (transacoesRecentes.length > 0) {
            const receitasMensais = transacoesRecentes
              .filter(t => t.tipo === 'receita')
              .reduce((sum, t) => sum + Number(t.valor), 0) / (transacoesRecentes.length > 30 ? 6 : 3);
              
            const ticketMedio = transacoesRecentes
              .filter(t => t.tipo === 'receita')
              .reduce((sum, t) => sum + Number(t.valor), 0) / 
              transacoesRecentes.filter(t => t.tipo === 'receita').length;
              
            prompt += `Com base nas transações recentes, a empresa tem receita mensal média de R$${receitasMensais.toFixed(2)} `;
            prompt += `e ticket médio de R$${ticketMedio.toFixed(2)}. `;
          }
          
          prompt += `Forneça os seguintes dados: 
            1. TAM (Total Addressable Market) em valores monetários (R$)
            2. SAM (Serviceable Addressable Market) em valores monetários (R$)
            3. SOM (Serviceable Obtainable Market) em valores monetários (R$)
            4. Lista dos 3-5 principais concorrentes neste mercado com market share e valuation estimados
            5. Três insights estratégicos baseados nestes dados
            6. Crescimento projetado para este mercado nos próximos 3 anos
            7. Barreiras de entrada principais`;
            
          const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${openaiApiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "Você é um especialista em análise de mercado e venture capital. Forneça análises precisas com base em dados reais. Use dados de crunchbase, pitchbook e outras fontes quando relevante."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature: 0.7
            })
          });
          
          const responseData = await response.json();
          
          if (responseData.choices && responseData.choices[0]) {
            const aiContent = responseData.choices[0].message.content;
            
            // Processar o conteúdo do AI para estruturar os dados
            aiEnrichedData = {
              ai_response: aiContent,
              parsed: parseAIResponse(aiContent, segment || "tecnologia", region, customerType || "B2B")
            };
          }
        } catch (error) {
          console.error("Erro ao enriquecer dados com IA:", error);
        }
      }
      
      // Combinar dados simulados com dados da IA, se disponíveis
      const tamMultiplier = Math.floor(Math.random() * 50 + 10);
      const samMultiplier = Math.floor(Math.random() * 10 + 2);
      const somMultiplier = Math.floor(Math.random() * 1000 + 200);
      
      let tamSamSomData = {
        tam: {
          value: tamMultiplier * 1000000000, // Entre 10B e 60B
          description: `Mercado total de ${segment || "tecnologia"} ${region ? `na região de ${region}` : "global"}`
        },
        sam: {
          value: samMultiplier * 1000000000, // Entre 2B e 12B
          description: `Parcela do mercado que pode ser atendida com a solução atual`
        },
        som: {
          value: somMultiplier * 1000000, // Entre 200M e 1.2B
          description: `Parcela realista do mercado que pode ser capturada nos próximos 3-5 anos`
        },
        competitors: [
          { 
            name: "Empresa Líder", 
            market_share: Math.floor(Math.random() * 20 + 15),
            valuation: `R$${Math.floor(Math.random() * 900 + 300)}M`,
            target: customerType || "B2B"
          },
          { 
            name: "Empresa Emergente", 
            market_share: Math.floor(Math.random() * 10 + 8),
            valuation: `R$${Math.floor(Math.random() * 300 + 100)}M`,
            target: customerType || "PME"
          },
          { 
            name: "Startup Inovadora", 
            market_share: Math.floor(Math.random() * 8 + 3),
            valuation: `R$${Math.floor(Math.random() * 100 + 50)}M`,
            target: customerType || "B2C"
          }
        ],
        insights: [
          `O mercado de ${segment || "tecnologia"} deve crescer 28% nos próximos 3 anos`,
          `Empresas com foco em ${customerType || "B2B"} têm CAC médio de R$750 e LTV de R$4.500`,
          `Existem ${Math.floor(Math.random() * 50 + 20)} competidores significativos neste espaço, com market share médio de 5-10%`
        ],
        growth_projection: "28%",
        entry_barriers: [
          "Conhecimento técnico especializado",
          "Relacionamentos com clientes estabelecidos",
          "Alto custo de aquisição inicial"
        ]
      };
      
      // Sobrescrever com dados da IA se disponíveis
      if (aiEnrichedData && aiEnrichedData.parsed) {
        const parsed = aiEnrichedData.parsed;
        
        if (parsed.tam) tamSamSomData.tam.value = parsed.tam;
        if (parsed.sam) tamSamSomData.sam.value = parsed.sam;
        if (parsed.som) tamSamSomData.som.value = parsed.som;
        
        if (parsed.competitors && parsed.competitors.length > 0) {
          tamSamSomData.competitors = parsed.competitors;
        }
        
        if (parsed.insights && parsed.insights.length > 0) {
          tamSamSomData.insights = parsed.insights;
        }
        
        if (parsed.growth_projection) {
          tamSamSomData.growth_projection = parsed.growth_projection;
        }
        
        if (parsed.entry_barriers && parsed.entry_barriers.length > 0) {
          tamSamSomData.entry_barriers = parsed.entry_barriers;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: tamSamSomData,
          ai_enriched: !!aiEnrichedData,
          raw_ai_data: aiEnrichedData ? aiEnrichedData.ai_response : null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Ação não suportada" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("Erro na função de dados de mercado:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor", details: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

// Função auxiliar para tentar extrair valores estruturados da resposta da IA
function parseAIResponse(text, segment, region, customerType) {
  const result = {
    tam: null,
    sam: null,
    som: null,
    competitors: [],
    insights: [],
    growth_projection: null,
    entry_barriers: []
  };
  
  try {
    // Extrair TAM, SAM, SOM
    const tamMatch = text.match(/TAM.*?R?\$?\s*(\d+[.,]?\d*)\s*(bilh[õoó]es|milh[õoó]es|mil)/i);
    const samMatch = text.match(/SAM.*?R?\$?\s*(\d+[.,]?\d*)\s*(bilh[õoó]es|milh[õoó]es|mil)/i);
    const somMatch = text.match(/SOM.*?R?\$?\s*(\d+[.,]?\d*)\s*(bilh[õoó]es|milh[õoó]es|mil)/i);
    
    if (tamMatch) {
      const value = parseFloat(tamMatch[1].replace(',', '.'));
      const unit = tamMatch[2].toLowerCase();
      if (unit.includes('bilh')) {
        result.tam = value * 1000000000;
      } else if (unit.includes('milh')) {
        result.tam = value * 1000000;
      } else {
        result.tam = value * 1000;
      }
    }
    
    if (samMatch) {
      const value = parseFloat(samMatch[1].replace(',', '.'));
      const unit = samMatch[2].toLowerCase();
      if (unit.includes('bilh')) {
        result.sam = value * 1000000000;
      } else if (unit.includes('milh')) {
        result.sam = value * 1000000;
      } else {
        result.sam = value * 1000;
      }
    }
    
    if (somMatch) {
      const value = parseFloat(somMatch[1].replace(',', '.'));
      const unit = somMatch[2].toLowerCase();
      if (unit.includes('bilh')) {
        result.som = value * 1000000000;
      } else if (unit.includes('milh')) {
        result.som = value * 1000000;
      } else {
        result.som = value * 1000;
      }
    }
    
    // Extrair competidores
    const lines = text.split('\n');
    let inCompetitorSection = false;
    
    for (const line of lines) {
      // Verificar se estamos na seção de competidores
      if (line.match(/principais concorrentes|competidores|players|empresas/i)) {
        inCompetitorSection = true;
        continue;
      }
      
      // Se estamos em outra seção claramente identificada, sair da seção de competidores
      if (inCompetitorSection && line.match(/^[0-9]+\.\s*(insights|barreiras|crescimento)/i)) {
        inCompetitorSection = false;
      }
      
      // Extrair competidor
      if (inCompetitorSection) {
        const competitorMatch = line.match(/([A-Za-z0-9\s]+)[\s-]*(\d+%?|\d+[.,]\d+%?).*?(R?\$?\s*\d+[.,]?\d*\s*(bilh[õoó]es|milh[õoó]es|[MB]))/i);
        if (competitorMatch) {
          const name = competitorMatch[1].trim();
          let marketShare = competitorMatch[2].trim();
          if (!marketShare.includes('%')) marketShare += '%';
          
          const valuation = competitorMatch[3].trim();
          
          result.competitors.push({
            name,
            market_share: parseInt(marketShare.replace('%', '')),
            valuation,
            target: customerType
          });
          
          // Limitar a 5 competidores
          if (result.competitors.length >= 5) {
            inCompetitorSection = false;
          }
        }
      }
    }
    
    // Extrair insights
    let inInsightSection = false;
    for (const line of lines) {
      if (line.match(/insights|estratég/i)) {
        inInsightSection = true;
        continue;
      }
      
      if (inInsightSection && line.match(/^[0-9]+\.\s*(barreiras|crescimento)/i)) {
        inInsightSection = false;
      }
      
      if (inInsightSection && line.match(/^\d+\.\s*(.+)$/)) {
        const insightText = line.replace(/^\d+\.\s*/, '').trim();
        if (insightText && insightText.length > 15) {
          result.insights.push(insightText);
        }
        
        if (result.insights.length >= 3) {
          inInsightSection = false;
        }
      }
    }
    
    // Extrair crescimento projetado
    const growthMatch = text.match(/crescimento.+?(\d+[.,]?\d*%)/i);
    if (growthMatch) {
      result.growth_projection = growthMatch[1];
    }
    
    // Extrair barreiras de entrada
    let inBarrierSection = false;
    for (const line of lines) {
      if (line.match(/barreira|entrada|dificuldade/i)) {
        inBarrierSection = true;
        continue;
      }
      
      if (inBarrierSection && line.trim() === '') {
        inBarrierSection = false;
      }
      
      if (inBarrierSection && line.match(/^\d+\.\s*(.+)$/)) {
        const barrierText = line.replace(/^\d+\.\s*/, '').trim();
        if (barrierText && barrierText.length > 5) {
          result.entry_barriers.push(barrierText);
        }
        
        if (result.entry_barriers.length >= 3) {
          inBarrierSection = false;
        }
      }
    }
    
  } catch (error) {
    console.error("Erro ao analisar resposta da IA:", error);
  }
  
  return result;
}
