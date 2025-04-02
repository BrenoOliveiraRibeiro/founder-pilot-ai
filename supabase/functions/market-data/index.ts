
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
    const crunchbaseApiKey = Deno.env.get("CRUNCHBASE_API_KEY") || "";
    const pitchbookApiKey = Deno.env.get("PITCHBOOK_API_KEY") || "";

    // Inicializa cliente do Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, empresa_id, setor, estagio } = await req.json();

    if (!empresa_id) {
      return new Response(
        JSON.stringify({ error: "Empresa ID é obrigatório" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

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
    
    return new Response(
      JSON.stringify({ error: "Ação não suportada" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("Erro na função de dados de mercado:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
