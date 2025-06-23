
import { getPluggyToken, callPluggyAPI } from "./utils.ts";

export async function refreshBalances(
  empresaId: string,
  pluggyClientId: string,
  pluggyClientSecret: string,
  sandbox: boolean,
  supabaseClient: any,
  corsHeaders: any
) {
  try {
    console.log(`Iniciando atualização de saldos para empresa ${empresaId}`);

    // Buscar integrações ativas da empresa
    const { data: integracoes, error: integracoesError } = await supabaseClient
      .from('integracoes_bancarias')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('status', 'ativo')
      .eq('tipo_conexao', 'Open Finance');

    if (integracoesError) {
      console.error("Erro ao buscar integrações:", integracoesError);
      throw integracoesError;
    }

    if (!integracoes || integracoes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Nenhuma integração ativa encontrada",
          updatedIntegrations: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Obter token da API
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    if (!tokenResult.success) {
      throw new Error("Falha ao obter token da API Pluggy");
    }

    const apiKey = tokenResult.data.apiKey;
    let updatedCount = 0;

    // Atualizar cada integração
    for (const integracao of integracoes) {
      if (!integracao.item_id) {
        console.warn(`Integração ${integracao.id} sem item_id, pulando...`);
        continue;
      }

      try {
        console.log(`Atualizando saldos para item ${integracao.item_id}`);
        
        // Buscar dados atualizados das contas
        const accountsResult = await callPluggyAPI(`/accounts?itemId=${integracao.item_id}`, 'GET', apiKey);
        
        if (accountsResult.success && accountsResult.data.results) {
          // Atualizar os dados da conta na integração
          const { error: updateError } = await supabaseClient
            .from('integracoes_bancarias')
            .update({
              account_data: accountsResult.data,
              ultimo_sincronismo: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', integracao.id);

          if (updateError) {
            console.error(`Erro ao atualizar integração ${integracao.id}:`, updateError);
          } else {
            console.log(`Saldos atualizados com sucesso para integração ${integracao.id}`);
            updatedCount++;
          }
        } else {
          console.warn(`Erro ao buscar contas para item ${integracao.item_id}:`, accountsResult.error);
        }
      } catch (error) {
        console.error(`Erro ao processar integração ${integracao.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `${updatedCount} integrações atualizadas com sucesso`,
        updatedIntegrations: updatedCount,
        totalIntegrations: integracoes.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Erro ao atualizar saldos:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao atualizar saldos", 
        message: error.message || "Erro interno do servidor"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
