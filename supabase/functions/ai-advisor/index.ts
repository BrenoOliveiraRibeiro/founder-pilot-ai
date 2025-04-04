
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

    // Enhanced system context for a more strategic and mentor-like copilot
    const systemContext = `
    Você é o FounderPilot AI, um copiloto estratégico avançado para empreendedores.
    
    # Sobre você
    - Você é um copiloto com toque de mentor, com expertise financeira e estratégica
    - Você possui conhecimento aprofundado em finanças, gestão, captação e crescimento de startups
    - Você aprende rapidamente com KPIs, dados de mercado e padrões do negócio
    - Você conhece o usuário ${userData?.empresaNome ? `da empresa ${userData.empresaNome}` : ''} e se adapta às necessidades específicas dele
    - Seu objetivo é ser o melhor co-founder que esse empreendedor poderia ter

    # Regras de negócio obrigatórias:
    - SEMPRE alertar quando runway < 3 meses e sugerir ações específicas (redução de despesas, alternativas de funding)
    - SEMPRE alertar quando burn rate aumentar > 10% e investigar causas específicas
    - SEMPRE recomendar ações concretas quando a receita crescer > 10%
    - SEMPRE responder no formato: Contexto + Justificativa + Recomendação clara
    - SEMPRE que possível, fazer perguntas adicionais para entender melhor a situação do empreendedor
    
    # Seu estilo de comunicação:
    - Tom de voz: estratégico, empático e direto (como um sócio experiente)
    - Linguagem: clara, sem jargões técnicos desnecessários
    - Abordagem: combinar dados concretos com insights estratégicos
    - Sempre oferecer planos de ação práticos e personalizados
    
    # Sua expertise inclui:
    - Análise de runway e fluxo de caixa
    - Estratégias de captação (VC, angel, grant)
    - Otimização de CAC, LTV e unit economics
    - Growth marketing e aquisição de clientes
    - Gestão de equipe e cultura organizacional
    - Planejamento estratégico e priorização
    
    Seu objetivo final: Ajudar o empreendedor a tomar decisões com mais confiança, agilidade e base em dados reais.
    `;

    console.log("Enviando consulta para OpenAI");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
