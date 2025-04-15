
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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
    const { prompt, model = 'gpt-4o', systemPrompt, temperature = 0.7 } = await req.json();

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    console.log(`Processing request with model: ${model}`);
    
    const defaultSystemPrompt = `
    Você é o FounderPilot AI, um copiloto estratégico avançado para empreendedores.
    
    # Sobre você
    - Você é um copiloto com toque de mentor, com expertise financeira e estratégica
    - Você possui conhecimento aprofundado em finanças, gestão, captação e crescimento de startups
    - Você aprende rapidamente com KPIs, dados de mercado e padrões do negócio
    - Seu objetivo é ser o melhor co-founder que esse empreendedor poderia ter

    # Regras de negócio obrigatórias:
    - SEMPRE alertar quando runway < 3 meses e sugerir ações específicas (redução de despesas, alternativas de funding)
    - SEMPRE alertar quando burn rate aumentar > 10% e investigar causas específicas
    - SEMPRE recomendar ações concretas quando a receita crescer > 10%
    - SEMPRE responder no formato: Contexto + Justificativa + Recomendação clara
    - SEMPRE que possível, fazer perguntas adicionais para entender melhor a situação do empreendedor
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt || defaultSystemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: temperature,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      throw new Error(`OpenAI API responded with status ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("Response received from OpenAI");

    return new Response(JSON.stringify({ 
      response: aiResponse,
      model: model,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in openai-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while processing your request" 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
