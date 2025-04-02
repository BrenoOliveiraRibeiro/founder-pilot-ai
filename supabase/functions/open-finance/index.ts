import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Constants for Belvo API
const BELVO_API_URL = "https://api.belvo.com";
const BELVO_SANDBOX_URL = "https://sandbox.belvo.com";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const belvoSecretId = Deno.env.get("BELVO_SECRET_ID") || "";
    const belvoSecretPassword = Deno.env.get("BELVO_SECRET_PASSWORD") || "";

    console.log("Using Belvo credentials - ID:", belvoSecretId ? belvoSecretId.substring(0, 5) + "***" : "not set");
    console.log("Password length:", belvoSecretPassword ? belvoSecretPassword.length : "not set");

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    const { action, empresa_id, institution, link_id, sandbox = true } = requestData;

    // API base URL based on environment
    const apiBaseUrl = sandbox ? BELVO_SANDBOX_URL : BELVO_API_URL;
    console.log(`Using Belvo ${sandbox ? 'SANDBOX' : 'PRODUCTION'} API: ${apiBaseUrl}`);

    if (!empresa_id && action !== "test_connection") {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Funções auxiliares para interagir com a API do Belvo
    async function callBelvoAPI(endpoint, method, body = null) {
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

    // Test connection function
    async function testBelvoConnection() {
      try {
        console.log("Testing Belvo connection using current credentials...");
        
        // First, try to get institutions to verify auth
        console.log("Verifying credentials with GET /api/institutions/ call");
        const institutionsResult = await callBelvoAPI('/api/institutions/', 'GET');
        
        if (!institutionsResult.success) {
          console.error("Failed basic API authentication test:", institutionsResult.error);
          return {
            success: false,
            message: "Falha na autenticação básica com a API Belvo",
            error: institutionsResult.error,
            errorType: "authentication_failure",
            status: institutionsResult.status
          };
        }
        
        console.log(`Successfully retrieved ${institutionsResult.data.length} institutions`);
        
        // If authentication works, proceed to test link creation
        console.log("Creating test link using sandbox credentials...");
        const createLinkResult = await callBelvoAPI('/api/links/', 'POST', {
          institution: 'banamex_mx_retail',
          username: 'fake-user',
          password: 'fake-password', 
          access_mode: 'single'
        });
        
        if (!createLinkResult.success) {
          console.error("Failed to create test link:", createLinkResult.error);
          return {
            success: false,
            message: "Falha ao criar link de teste",
            error: createLinkResult.error,
            errorType: "test_link_failure"
          };
        }
        
        console.log("Test link created:", createLinkResult.data.id);
        
        // Retrieve accounts for this link
        const accountsResult = await callBelvoAPI(`/api/accounts/?link=${createLinkResult.data.id}`, 'GET');
        
        if (!accountsResult.success) {
          console.error("Failed to retrieve accounts:", accountsResult.error);
          return {
            success: false,
            message: "Falha ao recuperar contas de teste",
            error: accountsResult.error,
            errorType: "accounts_retrieval_failure"
          };
        }
        
        console.log(`Retrieved ${accountsResult.data.length} test accounts`);
        return {
          success: true,
          message: "Conexão com a API Belvo realizada com sucesso",
          testLink: createLinkResult.data.id,
          accountsCount: accountsResult.data.length,
          accounts: accountsResult.data.slice(0, 2) // Return first 2 accounts as sample
        };
      } catch (error) {
        console.error("Belvo test connection failed:", error);
        return {
          success: false,
          message: "Teste de conexão Belvo falhou",
          error: error.message,
          errorType: "test_link_failure"
        };
      }
    }

    if (action === "test_connection") {
      // Test connection to Belvo API
      console.log("Running test_connection action");
      const testResult = await testBelvoConnection();
      console.log("Test result:", testResult);
      return new Response(
        JSON.stringify(testResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    else if (action === "authorize") {
      // Criar widget token
      console.log(`Iniciando autorização para empresa ${empresa_id} com ${institution} (sandbox: ${sandbox})`);
      
      // Primeiro, vamos validar o acesso à API Belvo com uma chamada simples
      try {
        const institutionsResult = await callBelvoAPI('/api/institutions/', 'GET');
        if (!institutionsResult.success) {
          console.error("Erro na validação de acesso à API Belvo:", institutionsResult.error);
          return new Response(
            JSON.stringify({ 
              error: "Falha na autenticação com a API Belvo. Verifique suas credenciais.",
              details: institutionsResult.error 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
          );
        }
        console.log(`Instituições disponíveis: ${institutionsResult.data.length}`);
      } catch (error) {
        console.error("Erro na validação de acesso à API Belvo:", error);
        return new Response(
          JSON.stringify({ 
            error: "Falha na autenticação com a API Belvo. Verifique suas credenciais.",
            details: error.message 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      
      try {
        const widgetTokenResult = await callBelvoAPI('/api/token/', 'POST', {
          id: belvoSecretId,
          password: belvoSecretPassword,
          scopes: 'read_institutions,write_links,read_links,read_accounts',
        });

        if (!widgetTokenResult.success || !widgetTokenResult.data.access) {
          throw new Error("Falha ao obter token de acesso do Belvo");
        }

        return new Response(
          JSON.stringify({ 
            widget_token: widgetTokenResult.data.access,
            institution
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } catch (error) {
        console.error("Erro ao obter widget token:", error);
        return new Response(
          JSON.stringify({ 
            error: "Falha ao obter token para o widget", 
            details: error.message
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    } 
    else if (action === "callback") {
      // Processar o callback após autorização do usuário
      if (!link_id) {
        return new Response(
          JSON.stringify({ error: "Link ID não fornecido" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log(`Processing callback for link: ${link_id}, sandbox mode: ${sandbox}`);

      // Buscar detalhes do link
      const linkDetailsResult = await callBelvoAPI(`/api/links/${link_id}/`, 'GET');
      
      if (!linkDetailsResult.success || !linkDetailsResult.data.id) {
        return new Response(
          JSON.stringify({ error: "Falha ao buscar detalhes do link", details: linkDetailsResult.error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const linkDetails = linkDetailsResult.data;
      console.log(`Link criado com sucesso: ${linkDetails.id} para instituição: ${linkDetails.institution}`);

      // Atualizar o status da integração no banco de dados
      const { data, error } = await supabase
        .from("integracoes_bancarias")
        .insert([
          {
            empresa_id,
            nome_banco: linkDetails.institution,
            tipo_conexao: "Open Finance",
            status: "ativo",
            ultimo_sincronismo: new Date().toISOString(),
            detalhes: { 
              link_id: linkDetails.id,
              institution: linkDetails.institution,
              access_mode: linkDetails.access_mode,
              sandbox: sandbox
            }
          }
        ]);

      if (error) {
        console.error("Erro ao salvar integração:", error);
        return new Response(
          JSON.stringify({ error: "Falha ao salvar integração" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Iniciar a sincronização inicial de dados
      await syncData(empresa_id, linkDetails.id, supabase, sandbox);

      return new Response(
        JSON.stringify({ success: true, message: "Integração ativada com sucesso" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    else if (action === "sync") {
      console.log(`Sincronizando dados da empresa ${empresa_id}`);
      
      // Se integration_id é fornecido, sincronizar apenas essa integração
      if (requestData.integration_id) {
        const { data: integracao, error: integracaoError } = await supabase
          .from("integracoes_bancarias")
          .select("*")
          .eq("id", requestData.integration_id)
          .eq("empresa_id", empresa_id)
          .eq("status", "ativo")
          .single();
          
        if (integracaoError) {
          throw new Error(`Integração não encontrada: ${integracaoError.message}`);
        }
        
        console.log(`Sincronizando integração específica: ${integracao.id}, ${integracao.nome_banco}`);
        await syncData(empresa_id, integracao.detalhes.link_id, supabase, integracao.detalhes.sandbox || false);
        
        // Atualizar o timestamp de sincronização
        await supabase
          .from("integracoes_bancarias")
          .update({ ultimo_sincronismo: new Date().toISOString() })
          .eq("id", integracao.id);
      } else {
        // Buscar todas as integrações ativas da empresa
        const { data: integracoes, error: integracoesError } = await supabase
          .from("integracoes_bancarias")
          .select("*")
          .eq("empresa_id", empresa_id)
          .eq("status", "ativo")
          .eq("tipo_conexao", "Open Finance");
          
        if (integracoesError) {
          throw integracoesError;
        }
        
        if (!integracoes || integracoes.length === 0) {
          return new Response(
            JSON.stringify({ error: "Nenhuma integração ativa encontrada" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
          );
        }
        
        console.log(`Encontradas ${integracoes.length} integrações ativas`);
        
        // Para cada integração, buscar os dados atualizados
        for (const integracao of integracoes) {
          try {
            await syncData(empresa_id, integracao.detalhes.link_id, supabase, integracao.detalhes.sandbox || false);
          } catch (error) {
            console.error(`Erro ao sincronizar integração ${integracao.id}:`, error);
          }
        }
        
        // Atualizar o timestamp de sincronização de todas as integrações
        await supabase
          .from("integracoes_bancarias")
          .update({ ultimo_sincronismo: new Date().toISOString() })
          .eq("empresa_id", empresa_id)
          .eq("tipo_conexao", "Open Finance");
      }
      
      // Buscar métricas atualizadas para retornar ao cliente
      const { data: metricasData } = await supabase
        .from("metricas")
        .select("*")
        .eq("empresa_id", empresa_id)
        .order("data_referencia", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Dados sincronizados com sucesso", 
          data: metricasData 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Função auxiliar para sincronizar dados do Belvo
    async function syncData(empresaId, linkId, supabaseClient, isSandbox = false) {
      try {
        console.log(`Iniciando sincronização de dados para empresa ${empresaId}, link ${linkId}, sandbox: ${isSandbox}`);
        
        // 1. Buscar balanços da conta
        const accountsResult = await callBelvoAPI(`/api/accounts/?link=${linkId}`, 'GET');
        
        if (!accountsResult.success || !accountsResult.data || accountsResult.data.length === 0) {
          throw new Error("Nenhuma conta encontrada");
        }
        
        const accounts = accountsResult.data;
        console.log(`Encontradas ${accounts.length} contas`);
        
        // 2. Buscar transações
        const transactionsResult = await callBelvoAPI(
          `/api/transactions/?link=${linkId}&date_from=${new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&date_to=${new Date().toISOString().split('T')[0]}`, 
          'GET'
        );
        
        if (!transactionsResult.success) {
          throw new Error("Falha ao buscar transações");
        }
        
        const transactions = transactionsResult.data;
        console.log(`Encontradas ${transactions.length} transações`);
        
        // 3. Calcular métricas relevantes
        // Saldo atual (soma dos saldos das contas)
        const caixaAtual = accounts.reduce((total, account) => total + parseFloat(account.balance.current), 0);
        
        // Separar transações em receitas e despesas
        const receitas = transactions.filter(tx => parseFloat(tx.amount) > 0);
        const despesas = transactions.filter(tx => parseFloat(tx.amount) < 0);
        
        // Calcular receita mensal (média dos últimos 3 meses)
        const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(parseFloat(tx.amount)), 0) / 3;
        
        // Calcular burn rate (média de despesas dos últimos 3 meses)
        const burnRate = Math.abs(despesas.reduce((total, tx) => total + parseFloat(tx.amount), 0)) / 3;
        
        // Calcular runway em meses
        const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
        
        // Calcular fluxo de caixa (receitas - despesas)
        const cashFlow = receitaMensal - burnRate;
        
        // Calcular crescimento do MRR (simplificado)
        const mrr_growth = 0; // Será calculado com dados históricos posteriormente
        
        console.log(`Métricas calculadas: Caixa: ${caixaAtual}, Receita: ${receitaMensal}, Burn: ${burnRate}, Runway: ${runwayMeses}`);
        
        // 4. Salvar métricas calculadas
        const { error: metricasError } = await supabaseClient
          .from("metricas")
          .insert([{
            empresa_id: empresaId,
            data_referencia: new Date().toISOString().split('T')[0],
            caixa_atual: caixaAtual,
            receita_mensal: receitaMensal,
            burn_rate: burnRate,
            runway_meses: runwayMeses,
            cash_flow: cashFlow,
            mrr_growth: mrr_growth
          }]);
          
        if (metricasError) {
          throw metricasError;
        }
        
        // 5. Salvar transações relevantes
        const transacoesFormatadas = transactions.slice(0, 50).map(tx => ({
          empresa_id: empresaId,
          descricao: tx.description,
          valor: parseFloat(tx.amount),
          data_transacao: tx.value_date,
          categoria: tx.category || 'Outros',
          tipo: parseFloat(tx.amount) > 0 ? 'receita' : 'despesa',
          metodo_pagamento: tx.type || 'Transferência',
          recorrente: false // Será determinado através de análise posterior
        }));
        
        if (transacoesFormatadas.length > 0) {
          const { error: txError } = await supabaseClient
            .from("transacoes")
            .insert(transacoesFormatadas);
            
          if (txError) {
            console.error("Erro ao salvar transações:", txError);
          }
        }
        
        // 6. Gerar insights (regras de negócio)
        await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
        
        console.log("Sincronização concluída com sucesso");
        return true;
      } catch (error) {
        console.error("Erro ao sincronizar dados:", error);
        throw error; // Re-throw para tratamento adequado no nível superior
      }
    }
    
    // Função auxiliar para gerar insights com base nos dados
    async function gerarInsights(empresaId, runway, burnRate, receita, caixaAtual, supabaseClient) {
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
    
    return new Response(
      JSON.stringify({ error: "Ação não suportada" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("Erro na função de Open Finance:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor", 
        message: error.message,
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
