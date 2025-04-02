
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
    const openFinanceApiKey = Deno.env.get("OPEN_FINANCE_API_KEY") || "";

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, empresa_id, authorization_code, provedor } = await req.json();

    if (!empresa_id) {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Verificar se o usuário tem acesso à empresa
    // Isso seria implementado com a lógica específica do seu provedor de Open Finance

    if (action === "authorize") {
      // Simula um processo de autorização
      // Em uma implementação real, você redirecionaria para a página de autorização do provedor
      console.log(`Iniciando autorização para empresa ${empresa_id} com provedor ${provedor}`);
      
      // Responder com um URL de autorização fictício
      return new Response(
        JSON.stringify({ 
          authorization_url: `https://auth.openfinance-provider.com/authorize?client_id=your-client-id&empresa_id=${empresa_id}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } 
    else if (action === "callback") {
      // Processar o callback após autorização do usuário
      if (!authorization_code) {
        return new Response(
          JSON.stringify({ error: "Código de autorização não fornecido" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Atualizar o status da integração no banco de dados
      const { data, error } = await supabase
        .from("integracoes_bancarias")
        .insert([
          {
            empresa_id,
            nome_banco: provedor,
            tipo_conexao: "Open Finance",
            status: "ativo",
            ultimo_sincronismo: new Date().toISOString(),
            detalhes: { authorization_code }
          }
        ]);

      if (error) {
        console.error("Erro ao salvar integração:", error);
        return new Response(
          JSON.stringify({ error: "Falha ao salvar integração" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Integração ativada com sucesso" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    else if (action === "sync") {
      console.log(`Sincronizando dados da empresa ${empresa_id}`);
      
      // Aqui seria o código para buscar dados financeiros atualizados
      // Em uma implementação real, você faria chamadas para a API do provedor
      
      // Simulando os dados financeiros obtidos
      const financialData = {
        caixa_atual: 124500,
        receita_mensal: 45800,
        burn_rate: 38200,
        runway_meses: 3.5,
        mrr_growth: 12.5,
        cash_flow: 7600
      };
      
      // Salvar métricas no banco de dados
      const { data, error } = await supabase
        .from("metricas")
        .insert([
          {
            empresa_id,
            data_referencia: new Date().toISOString().split('T')[0],
            ...financialData
          }
        ]);
        
      if (error) {
        console.error("Erro ao salvar métricas:", error);
        return new Response(
          JSON.stringify({ error: "Falha ao salvar métricas" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      // Atualizar o timestamp de sincronização
      await supabase
        .from("integracoes_bancarias")
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq("empresa_id", empresa_id)
        .eq("tipo_conexao", "Open Finance");
      
      return new Response(
        JSON.stringify({ success: true, message: "Dados sincronizados com sucesso", data: financialData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Ação não suportada" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("Erro na função de Open Finance:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
