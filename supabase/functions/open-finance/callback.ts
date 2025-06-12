
import { getPluggyToken, callPluggyAPI } from "./utils.ts";
import { processFinancialData } from "./financial-data.ts";

export async function processCallback(
  empresaId: string, 
  itemId: string, 
  sandbox: boolean, 
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  supabase: any, 
  corsHeaders: Record<string, string>
) {
  // Validate inputs
  if (!itemId) {
    return new Response(
      JSON.stringify({ error: "Item ID não fornecido" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }

  console.log(`Processing callback for item: ${itemId}, empresa: ${empresaId}, sandbox mode: ${sandbox}`);

  try {
    // Get authentication token
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Falha na autenticação com a API Pluggy", 
          details: tokenResult.error
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const apiKey = tokenResult.data.apiKey;
    
    // Fetch item details
    const itemResult = await callPluggyAPI(`/items/${itemId}`, 'GET', apiKey);
    
    if (!itemResult.success) {
      return new Response(
        JSON.stringify({ 
          error: "Falha ao buscar detalhes do item", 
          details: itemResult.error
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    const item = itemResult.data;
    console.log(`Item recuperado com sucesso: ${item.id} para conector: ${item.connector.name}`);
    
    // Get connector details
    const connectorResult = await callPluggyAPI(`/connectors/${item.connector.id}`, 'GET', apiKey);
    
    if (!connectorResult.success) {
      console.error("Erro ao buscar detalhes do conector:", connectorResult.error);
    }
    
    const connector = connectorResult.success ? connectorResult.data : null;
    const institutionName = connector ? connector.name : item.connector.name;
    
    // Save integration to database
    const { data: integrationData, error: integrationError } = await supabase
      .from("integracoes_bancarias")
      .insert([
        {
          empresa_id: empresaId,
          nome_banco: institutionName,
          tipo_conexao: "Open Finance",
          status: "ativo",
          ultimo_sincronismo: new Date().toISOString(),
          detalhes: { 
            item_id: item.id,
            connector_id: item.connector.id,
            institution: institutionName,
            sandbox: sandbox
          }
        }
      ])
      .select()
      .single();

    if (integrationError) {
      console.error("Erro ao salvar integração:", integrationError);
      return new Response(
        JSON.stringify({ error: "Falha ao salvar integração", details: integrationError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log("Integração salva com sucesso:", integrationData);

    // Start processing financial data
    await processFinancialData(empresaId, itemId, apiKey, pluggyClientId, pluggyClientSecret, sandbox, supabase);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Integração ativada e dados sincronizados com sucesso",
        integration: integrationData
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Erro ao processar callback:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao processar callback", 
        message: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
