import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export async function getPluggyToken(pluggyClientId: string, pluggyClientSecret: string, sandbox: boolean) {
  try {
    // For debugging
    console.log(`Getting Pluggy token with client ID: ${pluggyClientId.substring(0, 7)}... (sandbox: ${sandbox})`);
    
    const baseUrl = sandbox ? 'https://api.pluggy.ai' : 'https://api.pluggy.ai';
    
    const response = await fetch(`${baseUrl}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: pluggyClientId,
        clientSecret: pluggyClientSecret,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pluggy auth error: ${response.status} ${response.statusText}`, errorText);
      return {
        success: false,
        error: {
          status: response.status,
          message: errorText || 'Failed to authenticate with Pluggy API'
        }
      };
    }
    
    const data = await response.json();
    console.log('Successfully obtained Pluggy API key');
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error in getPluggyToken:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Unknown error occurred in getPluggyToken'
      }
    };
  }
}

export async function callPluggyAPI(endpoint: string, method: string, apiKey: string | null, body: any = null) {
  try {
    console.log(`Calling Pluggy API: ${method} ${endpoint}`);
    
    const baseUrl = 'https://api.pluggy.ai';
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    };
    
    const options: RequestInit = {
      method,
      headers,
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pluggy API error: ${response.status} ${response.statusText}`, errorText);
      return {
        success: false,
        error: {
          status: response.status,
          message: errorText || 'Failed to call Pluggy API'
        }
      };
    }
    
    const data = await response.json();
    console.log('Successfully called Pluggy API');
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error in callPluggyAPI:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Unknown error occurred in callPluggyAPI'
      }
    };
  }
}

export async function gerarInsights(empresaId: string, runwayMeses: number, burnRate: number, receitaMensal: number, caixaAtual: number, supabaseClient: any) {
  try {
    console.log(`Gerando insights para empresa ${empresaId}`);

    const insights = [];

    // Insight 1: Runway baixo
    if (runwayMeses < 3) {
      insights.push({
        empresa_id: empresaId,
        tipo: "Alerta",
        titulo: "Runway Crítico",
        descricao: `Seu runway é de apenas ${runwayMeses.toFixed(1)} meses. Reduza despesas ou aumente a receita urgentemente.`,
        prioridade: "alta",
        status: "pendente",
        data_criacao: new Date().toISOString()
      });
    }

    // Insight 2: Burn rate alto
    if (burnRate > receitaMensal) {
      insights.push({
        empresa_id: empresaId,
        tipo: "Alerta",
        titulo: "Burn Rate Elevado",
        descricao: `Seu burn rate (${burnRate.toFixed(0)}) excede sua receita mensal (${receitaMensal.toFixed(0)}). Avalie cortes de custos.`,
        prioridade: "media",
        status: "pendente",
        data_criacao: new Date().toISOString()
      });
    }

    // Insight 3: Caixa atual
    if (caixaAtual < 1000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "Alerta",
        titulo: "Caixa Baixo",
        descricao: `Seu caixa atual é de R$${caixaAtual.toFixed(0)}. Monitore de perto suas finanças.`,
        prioridade: "media",
        status: "pendente",
        data_criacao: new Date().toISOString()
      });
    }

    // Insight 4: Receita mensal
    if (receitaMensal > 10000) {
      insights.push({
        empresa_id: empresaId,
        tipo: "Recomendação",
        titulo: "Receita em Crescimento",
        descricao: `Sua receita mensal é de R$${receitaMensal.toFixed(0)}. Explore investimentos para escalar o negócio.`,
        prioridade: "baixa",
        status: "pendente",
        data_criacao: new Date().toISOString()
      });
    }

    if (insights.length > 0) {
      const { error: insightsError } = await supabaseClient
        .from("insights")
        .insert(insights);

      if (insightsError) {
        console.error("Erro ao salvar insights:", insightsError);
      }
    } else {
      console.log("Nenhum insight gerado");
    }

    console.log("Insights gerados com sucesso");
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    throw error;
  }
}
