
import { getPluggyToken, callPluggyAPI, gerarInsights } from "./utils.ts";

export async function processFinancialData(
  empresaId: string, 
  itemId: string, 
  accountId: string | null, 
  transactionsData: any,
  apiKey: string | null,
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  sandbox: boolean, 
  supabaseClient: any
) {
  try {
    console.log(`Iniciando processamento de dados financeiros para empresa ${empresaId}, item ${itemId}, sandbox: ${sandbox}`);
    
    // Get API key if not provided
    if (!apiKey) {
      const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
      if (!tokenResult.success) {
        throw new Error("Falha ao obter token da API Pluggy");
      }
      apiKey = tokenResult.data.apiKey;
    }
    
    // Get account data to determine which account to use
    let targetAccountId = accountId;
    let accountData = null;
    
    if (!targetAccountId) {
      console.log(`Buscando contas para item ${itemId}`);
      const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
      if (accountsResult.success && accountsResult.data.results && accountsResult.data.results.length > 0) {
        // Use the first account by default
        targetAccountId = accountsResult.data.results[0].id;
        accountData = accountsResult.data.results[0];
        console.log(`Usando conta padrão: ${targetAccountId} (${accountData.name})`);
      } else {
        console.warn("Nenhuma conta encontrada para o item:", itemId);
        return {
          success: true,
          message: "Nenhuma conta encontrada",
          newTransactions: 0,
          duplicates: 0,
          total: 0
        };
      }
    }
    
    // Use provided transactions data or fetch from API
    let allTransactions = [];
    
    if (transactionsData && transactionsData.results) {
      console.log(`Usando transações fornecidas: ${transactionsData.results.length}`);
      allTransactions = transactionsData.results;
    } else {
      // Fetch from API
      console.log(`Buscando transações da API para conta ${targetAccountId}`);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const fromDate = threeMonthsAgo.toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];
      
      const transactionsResult = await callPluggyAPI(
        `/transactions?accountId=${targetAccountId}&from=${fromDate}&to=${toDate}`, 
        'GET',
        apiKey
      );
      
      if (transactionsResult.success && transactionsResult.data.results) {
        allTransactions = transactionsResult.data.results;
        console.log(`Transações obtidas da API: ${allTransactions.length}`);
      } else {
        console.warn(`Erro ao buscar transações para a conta ${targetAccountId}:`, transactionsResult.error);
        allTransactions = [];
      }
    }
    
    console.log(`Processando ${allTransactions.length} transações`);
    
    if (allTransactions.length === 0) {
      console.log("Nenhuma transação para processar");
      return {
        success: true,
        message: "Nenhuma transação encontrada para processar",
        newTransactions: 0,
        duplicates: 0,
        total: 0
      };
    }
    
    // Preparar transações formatadas para upsert
    const transacoesFormatadas = allTransactions.map(tx => ({
      empresa_id: empresaId,
      descricao: tx.description || 'Transação',
      valor: tx.amount,
      data_transacao: tx.date,
      categoria: tx.category || 'Outros',
      tipo: tx.amount > 0 ? 'receita' : 'despesa',
      metodo_pagamento: tx.type || 'Transferência',
      recorrente: false
      // transaction_hash será gerado automaticamente pelo trigger
    }));
    
    console.log(`Tentando inserir ${transacoesFormatadas.length} transações usando upsert`);
    
    // Usar upsert com conflict resolution baseado no hash da transação
    let insertedCount = 0;
    let duplicateCount = 0;
    
    // Processar em lotes otimizados para upsert
    const batchSize = 100; // Aumentado para upsert
    for (let i = 0; i < transacoesFormatadas.length; i += batchSize) {
      const batch = transacoesFormatadas.slice(i, i + batchSize);
      
      try {
        console.log(`Processando lote ${Math.floor(i / batchSize) + 1} de ${Math.ceil(transacoesFormatadas.length / batchSize)}: ${batch.length} transações`);
        
        // Usar upsert em vez de insert para otimizar
        const { data, error } = await supabaseClient
          .from("transacoes")
          .upsert(batch, {
            onConflict: 'transaction_hash',
            ignoreDuplicates: false
          })
          .select('id');
        
        if (error) {
          console.error(`Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
          // Fallback para processamento individual
          for (const tx of batch) {
            try {
              const { data: singleData, error: singleError } = await supabaseClient
                .from("transacoes")
                .upsert([tx], {
                  onConflict: 'transaction_hash',
                  ignoreDuplicates: false
                })
                .select('id');
              
              if (!singleError) {
                insertedCount++;
              } else if (singleError.code === '23505') {
                duplicateCount++;
              }
            } catch (singleTxError) {
              console.error('Erro individual:', singleTxError);
              duplicateCount++;
            }
          }
        } else {
          const batchInserted = data ? data.length : 0;
          insertedCount += batchInserted;
          console.log(`Lote ${Math.floor(i / batchSize) + 1}: ${batchInserted} transações processadas com sucesso`);
        }
      } catch (batchError) {
        console.error(`Erro crítico no lote ${Math.floor(i / batchSize) + 1}:`, batchError);
        // Fallback para processamento individual
        for (const tx of batch) {
          try {
            const { data: singleData, error: singleError } = await supabaseClient
              .from("transacoes")
              .upsert([tx], {
                onConflict: 'transaction_hash',
                ignoreDuplicates: false
              })
              .select('id');
            
            if (!singleError) {
              insertedCount++;
            } else {
              duplicateCount++;
            }
          } catch (singleTxError) {
            console.error('Erro individual crítico:', singleTxError);
            duplicateCount++;
          }
        }
      }
    }
    
    console.log(`Resultado final: ${insertedCount} transações processadas, ${duplicateCount} duplicatas gerenciadas`);
    
    // Calcular e atualizar métricas usando upsert
    if (insertedCount > 0 || !accountData) {
      console.log('Atualizando métricas devido a mudanças...');
      
      // Buscar dados da conta para calcular métricas se não tivermos
      if (!accountData && targetAccountId) {
        const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
        if (accountsResult.success && accountsResult.data.results) {
          accountData = accountsResult.data.results.find((acc: any) => acc.id === targetAccountId);
        }
      }
      
      // Buscar todas as transações da empresa para calcular métricas
      const { data: todasTransacoes, error: txError } = await supabaseClient
        .from("transacoes")
        .select("*")
        .eq("empresa_id", empresaId)
        .gte("data_transacao", new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      
      if (!txError && todasTransacoes) {
        const receitas = todasTransacoes.filter(tx => tx.valor > 0);
        const despesas = todasTransacoes.filter(tx => tx.valor < 0);
        
        const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(tx.valor), 0) / 3;
        const burnRate = Math.abs(despesas.reduce((total, tx) => total + tx.valor, 0)) / 3;
        const caixaAtual = accountData ? accountData.balance : 0;
        const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
        const cashFlow = receitaMensal - burnRate;
        
        // Usar upsert para métricas - mais eficiente
        const { error: metricasError } = await supabaseClient
          .from("metricas")
          .upsert({
            empresa_id: empresaId,
            data_referencia: new Date().toISOString().split('T')[0],
            caixa_atual: caixaAtual,
            receita_mensal: receitaMensal,
            burn_rate: burnRate,
            runway_meses: runwayMeses,
            cash_flow: cashFlow,
            mrr_growth: 0
          }, {
            onConflict: 'empresa_id,data_referencia'
          });
          
        if (metricasError) {
          console.error("Erro ao salvar métricas:", metricasError);
        } else {
          console.log("Métricas atualizadas com upsert:", { receitaMensal, burnRate, runwayMeses });
        }
        
        // Gerar insights apenas se houve mudanças significativas
        await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
      }
    } else {
      console.log('Nenhuma transação nova - métricas não atualizadas');
    }
    
    console.log("Processamento de dados financeiros concluído com sucesso");
    
    // Determinar mensagem de retorno
    let message = "";
    if (insertedCount > 0) {
      message = `${insertedCount} transações processadas`;
      if (duplicateCount > 0) {
        message += ` (${duplicateCount} duplicatas gerenciadas)`;
      }
    } else if (duplicateCount > 0) {
      message = "Nenhuma transação nova - todas já estão salvas";
    } else {
      message = "Nenhuma transação nova encontrada";
    }
    
    return {
      success: true,
      message: message,
      newTransactions: insertedCount,
      duplicates: duplicateCount,
      total: allTransactions.length
    };
  } catch (error) {
    console.error("Erro ao processar dados financeiros:", error);
    throw error;
  }
}
