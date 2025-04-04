
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
    const { message, userData, financialData } = await req.json();

    // Sistema de contexto personalizado baseado no papel de copiloto financeiro
    const systemContext = `
    Você é o FounderPilot AI, um copiloto estratégico para fundadores de startups.
    
    Regras importantes:
    - Sempre alerte quando runway < 3 meses e sugira redução de despesas, alternativas de funding
    - Alerte quando burn rate aumentar > 10% e investigue causas
    - Recomende ações quando a receita crescer > 10%
    - Responda sempre no formato: Contexto + Justificativa + Recomendação clara
    
    Objetivo: Ser um copiloto confiável que ajuda a tomar decisões com mais confiança, agilidade e base em dados.
    Tom de voz: direto, humano e estratégico (como um sócio experiente)
    `;

    console.log("Enviando consulta para OpenAI");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContext },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Erro na API OpenAI:", error);
      throw new Error(`OpenAI API respondeu com status ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log("Resposta recebida da OpenAI");

    return new Response(JSON.stringify({ 
      response: aiResponse,
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
