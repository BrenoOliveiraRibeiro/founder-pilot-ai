
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

    console.log("Using Belvo credentials - ID:", belvoSecretId.substring(0, 5) + "***");

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, empresa_id, institution, link_id } = await req.json();

    if (!empresa_id) {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Funções auxiliares para interagir com a API do Belvo
    async function callBelvoAPI(endpoint, method, body = null) {
      const url = `${BELVO_API_URL}${endpoint}`;
      const headers = new Headers({
        'Authorization': `Basic ${btoa(`${belvoSecretId}:${belvoSecretPassword}`)}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });

      const options = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
      };

      console.log(`Calling Belvo API: ${method} ${endpoint}`);
      const response = await fetch(url, options);
      
      // Log entire response for debugging
      const responseText = await response.text();
      console.log(`Belvo API Response (${response.status}):`, responseText);
      
      // Try to parse as JSON if possible
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse Belvo response as JSON:", e);
        responseData = { text: responseText };
      }
      
      if (!response.ok) {
        console.error("Belvo API Error:", responseData);
        throw new Error(`Belvo API Error: ${JSON.stringify(responseData)}`);
      }
      
      return responseData;
    }

    // Test connection function - similar to your Python example
    async function testBelvoConnection() {
      try {
        console.log("Testing Belvo connection...");
        
        // 1. Create a test link (similar to your Python example)
        const createLinkResponse = await callBelvoAPI('/api/links/', 'POST', {
          institution: 'banamex_mx_retail',
          username: 'fake-user',
          password: 'fake-password', 
          access_mode: 'single'
        });
        
        console.log("Test link created:", createLinkResponse.id);
        
        // 2. Retrieve accounts for this link
        const accounts = await callBelvoAPI('/api/accounts/', 'GET', {
          link: createLinkResponse.id,
          save_data: false
        });
        
        console.log(`Retrieved ${accounts.length} test accounts`);
        return {
          success: true,
          message: "Belvo connection test successful",
          testLink: createLinkResponse.id,
          accountsCount: accounts.length
        };
      } catch (error) {
        console.error("Belvo test connection failed:", error);
        return {
          success: false,
          message: "Belvo connection test failed",
          error: error.message
        };
      }
    }

    if (action === "test_connection") {
      // Test connection to Belvo API
      const testResult = await testBelvoConnection();
      return new Response(
        JSON.stringify(testResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    else if (action === "authorize") {
      // Criar widget token
      console.log(`Iniciando autorização para empresa ${empresa_id} com ${institution}`);
      
      // Primeiro, vamos validar o acesso à API Belvo com uma chamada simples
      try {
        const institutionsResponse = await callBelvoAPI('/api/institutions/', 'GET');
        console.log(`Instituições disponíveis: ${institutionsResponse.length}`);
      } catch (error) {
        console.error("Erro na validação de acesso à API Belvo:", error);
        return new Response(
          JSON.stringify({ error: "Falha na autenticação com a API Belvo. Verifique suas credenciais." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }
      
      const widgetTokenResponse = await callBelvoAPI('/api/token/', 'POST', {
        id: belvoSecretId,
        password: belvoSecretPassword,
        scopes: 'read_institutions,write_links,read_links',
      });

      if (!widgetTokenResponse.access) {
        throw new Error("Falha ao obter token de acesso do Belvo");
      }

      return new Response(
        JSON.stringify({ 
          widget_token: widgetTokenResponse.access,
          institution
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } 
    else if (action === "callback") {
      // Processar o callback após autorização do usuário
      if (!link_id) {
        return new Response(
          JSON.stringify({ error: "Link ID não fornecido" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Buscar detalhes do link
      const linkDetails = await callBelvoAPI(`/api/links/${link_id}/`, 'GET');
      
      if (!linkDetails.id) {
        throw new Error("Falha ao buscar detalhes do link");
      }

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
              access_mode: linkDetails.access_mode
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
      await syncData(empresa_id, linkDetails.id, supabase);

      return new Response(
        JSON.stringify({ success: true, message: "Integração ativada com sucesso" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    else if (action === "sync") {
      console.log(`Sincronizando dados da empresa ${empresa_id}`);
      
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
      const syncPromises = integracoes.map(integracao => 
        syncData(empresa_id, integracao.detalhes.link_id, supabase)
      );
      
      await Promise.all(syncPromises);
      
      // Atualizar o timestamp de sincronização de todas as integrações
      await supabase
        .from("integracoes_bancarias")
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq("empresa_id", empresa_id)
        .eq("tipo_conexao", "Open Finance");
      
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
    async function syncData(empresaId, linkId, supabaseClient) {
      try {
        console.log(`Iniciando sincronização de dados para empresa ${empresaId}, link ${linkId}`);
        
        // 1. Buscar balanços da conta
        const accounts = await callBelvoAPI('/api/accounts/', 'GET', {
          link: linkId,
          save_data: true
        });
        
        if (!accounts || accounts.length === 0) {
          throw new Error("Nenhuma conta encontrada");
        }
        
        console.log(`Encontradas ${accounts.length} contas`);
        
        // 2. Buscar transações
        const transactions = await callBelvoAPI('/api/transactions/', 'GET', {
          link: linkId,
          date_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // últimos 90 dias
          date_to: new Date().toISOString().split('T')[0],
          save_data: true
        });
        
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
        await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, supabaseClient);
        
        console.log("Sincronização concluída com sucesso");
        return true;
      } catch (error) {
        console.error("Erro ao sincronizar dados:", error);
        return false;
      }
    }
    
    // Função auxiliar para gerar insights com base nos dados
    async function gerarInsights(empresaId, runway, burnRate, receita, supabaseClient) {
      const insights = [];
      
      // Regra de negócio: Runway < 3 meses
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
      
      // Regra de negócio: burn rate > 10% do mês anterior
      // Essa lógica seria implementada comparando com os dados históricos
      
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
      
      // Salvar insights gerados
      if (insights.length > 0) {
        const { error } = await supabaseClient
          .from("insights")
          .insert(insights);
          
        if (error) {
          console.error("Erro ao salvar insights:", error);
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
      JSON.stringify({ error: "Erro interno do servidor", message: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
