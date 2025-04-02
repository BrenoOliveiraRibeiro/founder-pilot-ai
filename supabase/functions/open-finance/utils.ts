
// Constants for Belvo API
export const BELVO_API_URL = "https://api.belvo.com";
export const BELVO_SANDBOX_URL = "https://sandbox.belvo.com";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper function to call Belvo API
export async function callBelvoAPI(endpoint: string, method: string, belvoSecretId: string, belvoSecretPassword: string, sandbox: boolean, body: any = null) {
  const apiBaseUrl = sandbox ? BELVO_SANDBOX_URL : BELVO_API_URL;
  const url = `${apiBaseUrl}${endpoint}`;
  const authString = `${belvoSecretId}:${belvoSecretPassword}`;
  const encodedAuth = btoa(authString);
  
  console.log(`Auth string first chars: ${authString.substring(0, 5)}...`);
  console.log(`Encoded Auth first chars: ${encodedAuth.substring(0, 10)}...`);
  console.log(`Full URL: ${url}`);
  
  const headers = new Headers({
    'Authorization': `Basic ${encodedAuth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  const options = {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  };

  console.log(`Calling Belvo API: ${method} ${endpoint}`);
  
  try {
    const response = await fetch(url, options);
    
    // Log response details
    console.log(`Belvo API Response Status: ${response.status}`);
    console.log(`Response Headers:`, Object.fromEntries([...response.headers]));
    
    // Get the raw response text
    const responseText = await response.text();
    console.log(`Response Body (first 500 chars): ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
    
    // Try to parse as JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Belvo response as JSON:", e);
      responseData = { text: responseText, rawError: e.message };
    }
    
    if (!response.ok) {
      console.error(`Belvo API Error (${response.status}):`, responseData);
      return { 
        success: false, 
        error: responseData,
        status: response.status,
        errorType: response.status === 401 ? "authentication_failure" : "api_error" 
      };
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error(`Network error calling Belvo API at ${endpoint}:`, error);
    return { 
      success: false, 
      error: { message: error.message },
      errorType: "network_error" 
    };
  }
}

// Helper to generate insights based on financial metrics
export async function gerarInsights(empresaId: string, runway: number, burnRate: number, receita: number, caixaAtual: number, supabaseClient: any) {
  const insights = [];
  
  // Regra de negócio: Runway < 3 meses (ALTA PRIORIDADE)
  if (runway < 3) {
    insights.push({
      empresa_id: empresaId,
      tipo: "alerta",
      titulo: `Runway crítico de ${runway.toFixed(1)} meses - Ação urgente necessária`,
      descricao: "Seu caixa atual durará menos de 3 meses no ritmo atual de gastos. Recomendamos revisão de despesas ou planejamento de captação.",
      prioridade: "alta",
      status: "pendente"
    });
  }
  // Regra de negócio: Runway < 6 meses (MÉDIA PRIORIDADE)
  else if (runway < 6) {
    insights.push({
      empresa_id: empresaId,
      tipo: "alerta",
      titulo: `Runway limitado de ${runway.toFixed(1)} meses - Planeje sua próxima captação`,
      descricao: "Seu caixa atual durará menos de 6 meses. Recomendamos iniciar planejamento de captação ou redução de despesas não-essenciais.",
      prioridade: "media",
      status: "pendente"
    });
  }
  
  // Regra de negócio: burn rate > valor de referência do setor
  // Usando um valor fixo temporariamente até termos benchmarks do setor
  const burnRateReferencia = 30000; // Exemplo: R$ 30.000/mês
  if (burnRate > burnRateReferencia) {
    insights.push({
      empresa_id: empresaId,
      tipo: "alerta",
      titulo: `Burn rate elevado de R$${burnRate.toFixed(2)} por mês`,
      descricao: `Sua taxa de queima mensal está acima da referência para startups em estágio similar. Analise categorias de despesas para identificar oportunidades de otimização.`,
      prioridade: "media",
      status: "pendente"
    });
  }
  
  // Regra de negócio: crescimento de receita
  // Simular para este exemplo
  if (receita > burnRate * 1.2) {
    insights.push({
      empresa_id: empresaId,
      tipo: "projeção",
      titulo: "Crescimento sustentável - Receita supera burn rate em mais de 20%",
      descricao: "Sua empresa está em trajetória sustentável de crescimento, com receita superior ao burn rate, criando um fluxo de caixa positivo.",
      prioridade: "baixa",
      status: "pendente"
    });
  }
  
  // Regra de negócio: Caixa disponível para investimento
  if (caixaAtual > burnRate * 12) {
    insights.push({
      empresa_id: empresaId,
      tipo: "sugestão",
      titulo: "Oportunidade de investimento em crescimento",
      descricao: "Com mais de 12 meses de runway, você pode considerar investir parte do caixa em iniciativas de crescimento como marketing ou contratações estratégicas.",
      prioridade: "baixa",
      status: "pendente"
    });
  }
  
  // Salvar insights gerados
  if (insights.length > 0) {
    const { error } = await supabaseClient
      .from("insights")
      .insert(insights);
      
    if (error) {
      console.error("Erro ao salvar insights:", error);
    } else {
      console.log(`${insights.length} insights gerados e salvos com sucesso`);
    }
  }
}
