
import { getPluggyToken } from "./utils.ts";
import { processFinancialData } from "./financial-data.ts";

async function updatePluggyItem(itemId: string, apiKey: string) {
  console.log(`Atualizando item ${itemId} na Pluggy antes da sincronização...`);
  
  try {
    const response = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'X-API-KEY': apiKey
      }
    });

    if (!response.ok) {
      console.error(`Erro ao atualizar item ${itemId}: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Detalhes do erro:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

    const result = await response.json();
    console.log(`Item ${itemId} atualizado com sucesso:`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Erro na requisição PATCH para item ${itemId}:`, error);
    return { success: false, error: error.message };
  }
}

async function fetchUpdatedAccountData(itemId: string, apiKey: string) {
  console.log(`Buscando dados atualizados das contas para item ${itemId}...`);
  
  try {
    const response = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-KEY': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const accountData = await response.json();
    console.log(`Dados das contas atualizados para item ${itemId}:`, accountData);
    return accountData;
  } catch (error) {
    console.error(`Erro ao buscar dados das contas para item ${itemId}:`, error);
    throw error;
  }
}

export async function syncData(
  empresaId: string, 
  integrationId: string | undefined, 
  sandbox: boolean, 
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  supabase: any, 
  corsHeaders: Record<string, string>
) {
  console.log(`Sincronizando dados da empresa ${empresaId}`);
  
  try {
    // Get API key
    const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
    
    if (!tokenResult.success) {
      throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error.message}`);
    }
    
    const apiKey = tokenResult.data.apiKey;
    
    // If integration_id is provided, sync only that integration
    if (integrationId) {
      const { data: integracao, error: integracaoError } = await supabase
        .from("integracoes_bancarias")
        .select("*")
        .eq("id", integrationId)
        .eq("empresa_id", empresaId)
        .eq("status", "ativo")
        .single();
        
      if (integracaoError) {
        throw new Error(`Integração não encontrada: ${integracaoError.message}`);
      }
      
      console.log(`Sincronizando integração específica: ${integracao.id}, ${integracao.nome_banco}`);
      
      const itemId = integracao.detalhes.item_id || integracao.item_id;
      
      // 1. PATCH: Atualizar item na Pluggy para forçar atualização dos dados
      console.log('Etapa 1: Atualizando dados do item na Pluggy...');
      const updateResult = await updatePluggyItem(itemId, apiKey);
      
      if (!updateResult.success) {
        console.warn(`Aviso: Não foi possível atualizar o item ${itemId}: ${updateResult.error}`);
        // Continua com a sincronização mesmo se o PATCH falhar
      }
      
      // 2. GET: Buscar dados atualizados das contas
      console.log('Etapa 2: Buscando dados atualizados das contas...');
      let updatedAccountData = null;
      try {
        updatedAccountData = await fetchUpdatedAccountData(itemId, apiKey);
        
        // Atualizar account_data na integração
        await supabase
          .from("integracoes_bancarias")
          .update({ 
            account_data: updatedAccountData,
            ultimo_sincronismo: new Date().toISOString()
          })
          .eq("id", integracao.id);
          
        console.log('Dados das contas atualizados na base de dados');
      } catch (error) {
        console.warn(`Aviso: Não foi possível buscar dados atualizados das contas: ${error.message}`);
        // Usa dados existentes se não conseguir buscar novos
        updatedAccountData = integracao.account_data;
      }
      
      // 3. Processar dados financeiros (transações)
      console.log('Etapa 3: Processando transações...');
      const result = await processFinancialData(
        empresaId, 
        itemId, 
        null, // accountId será determinado automaticamente
        null, // transactionsData será buscado da API
        apiKey,
        pluggyClientId, 
        pluggyClientSecret, 
        integracao.detalhes.sandbox || sandbox, 
        supabase
      );
      
      console.log(`Resultado da sincronização: ${result.message}, novas: ${result.newTransactions}, duplicatas: ${result.duplicates}`);
        
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: result.message,
          newTransactions: result.newTransactions || 0,
          duplicates: result.duplicates || 0,
          total: result.total || 0,
          accountDataUpdated: updateResult.success
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    } else {
      // Fetch all active integrations for the company
      const { data: integracoes, error: integracoesError } = await supabase
        .from("integracoes_bancarias")
        .select("*")
        .eq("empresa_id", empresaId)
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
      
      let totalNewTransactions = 0;
      let totalDuplicates = 0;
      let totalProcessed = 0;
      let accountsUpdated = 0;
      
      // For each integration, update item data and process financial data
      for (const integracao of integracoes) {
        try {
          console.log(`Processando integração: ${integracao.nome_banco} (${integracao.id})`);
          
          const itemId = integracao.detalhes.item_id || integracao.item_id;
          
          // 1. PATCH: Atualizar item na Pluggy
          console.log(`Etapa 1: Atualizando item ${itemId} na Pluggy...`);
          const updateResult = await updatePluggyItem(itemId, apiKey);
          
          if (updateResult.success) {
            accountsUpdated++;
          }
          
          // 2. GET: Buscar dados atualizados das contas
          console.log(`Etapa 2: Buscando dados atualizados das contas para ${itemId}...`);
          try {
            const updatedAccountData = await fetchUpdatedAccountData(itemId, apiKey);
            
            // Atualizar account_data na integração
            await supabase
              .from("integracoes_bancarias")
              .update({ account_data: updatedAccountData })
              .eq("id", integracao.id);
              
            console.log(`Dados das contas atualizados para ${integracao.nome_banco}`);
          } catch (error) {
            console.warn(`Aviso: Não foi possível atualizar dados das contas para ${integracao.nome_banco}: ${error.message}`);
          }
          
          // 3. Processar dados financeiros
          console.log(`Etapa 3: Processando transações para ${integracao.nome_banco}...`);
          const result = await processFinancialData(
            empresaId, 
            itemId, 
            null, // accountId será determinado automaticamente
            null, // transactionsData será buscado da API
            apiKey,
            pluggyClientId, 
            pluggyClientSecret, 
            integracao.detalhes.sandbox || sandbox, 
            supabase
          );
          
          totalNewTransactions += result.newTransactions || 0;
          totalDuplicates += result.duplicates || 0;
          totalProcessed += result.total || 0;
          
          console.log(`Integração ${integracao.nome_banco}: ${result.newTransactions} novas, ${result.duplicates} duplicatas`);
        } catch (error) {
          console.error(`Erro ao sincronizar integração ${integracao.id}:`, error);
        }
      }
      
      // Update sync timestamp for all integrations
      await supabase
        .from("integracoes_bancarias")
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq("empresa_id", empresaId)
        .eq("tipo_conexao", "Open Finance");
      
      // Determinar mensagem baseada no resultado
      let message = "";
      if (totalNewTransactions > 0) {
        message = `${totalNewTransactions} novas transações sincronizadas`;
        if (totalDuplicates > 0) {
          message += ` (${totalDuplicates} duplicatas ignoradas)`;
        }
      } else if (totalDuplicates > 0) {
        message = "Nenhuma transação nova encontrada - todas já estão salvas";
      } else {
        message = "Nenhuma transação encontrada para sincronizar";
      }
      
      if (accountsUpdated > 0) {
        message += `. ${accountsUpdated} conta(s) atualizadas.`;
      }
      
      console.log(`Sincronização completa: ${message}`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: message,
          newTransactions: totalNewTransactions,
          duplicates: totalDuplicates,
          total: totalProcessed,
          accountsUpdated: accountsUpdated
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro na sincronização:", error);
    return new Response(
      JSON.stringify({ 
        error: "Falha ao sincronizar dados", 
        message: error.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
