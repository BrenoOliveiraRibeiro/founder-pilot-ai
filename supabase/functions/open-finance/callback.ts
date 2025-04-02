
import { callBelvoAPI } from "./utils.ts";
import { processFinancialData } from "./financial-data.ts";

export async function processCallback(
  empresaId: string, 
  linkId: string, 
  sandbox: boolean, 
  belvoSecretId: string, 
  belvoSecretPassword: string, 
  supabase: any, 
  corsHeaders: Record<string, string>
) {
  // Validate inputs
  if (!linkId) {
    return new Response(
      JSON.stringify({ error: "Link ID não fornecido" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  console.log(`Processing callback for link: ${linkId}, sandbox mode: ${sandbox}`);

  // Fetch link details
  const linkDetailsResult = await callBelvoAPI(`/api/links/${linkId}/`, 'GET', belvoSecretId, belvoSecretPassword, sandbox);
  
  if (!linkDetailsResult.success || !linkDetailsResult.data.id) {
    return new Response(
      JSON.stringify({ error: "Falha ao buscar detalhes do link", details: linkDetailsResult.error }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  const linkDetails = linkDetailsResult.data;
  console.log(`Link criado com sucesso: ${linkDetails.id} para instituição: ${linkDetails.institution}`);

  // Update integration status in database
  const { data, error } = await supabase
    .from("integracoes_bancarias")
    .insert([
      {
        empresa_id: empresaId,
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

  // Start initial data synchronization
  await processFinancialData(empresaId, linkDetails.id, belvoSecretId, belvoSecretPassword, sandbox, supabase);

  return new Response(
    JSON.stringify({ success: true, message: "Integração ativada com sucesso" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
  );
}
