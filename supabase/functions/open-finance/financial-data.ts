
import { getPluggyToken, callPluggyAPI, gerarInsights } from "./utils.ts";

export async function processFinancialData(
  empresaId: string, 
  itemId: string, 
  accountId: string, 
  transactionsData: any,
  apiKey: string | null,
  pluggyClientId: string, 
  pluggyClientSecret: string, 
  sandbox: boolean, 
  supabaseClient: any
) {
  try {
    console.log(`Iniciando processamento de dados financeiros para empresa ${empresaId}, item ${itemId}, conta ${accountId}, sandbox: ${sandbox}`);
    
    // Get API key if not provided
    if (!apiKey) {
      const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
      if (!tokenResult.success) {
        throw new Error("Falha ao obter token da API Pluggy");
      }
      apiKey = tokenResult.data.apiKey;
    }
    
    // Use provided transactions data or fetch from API
    let allTransactions = [];
    
    if (transactionsData && transactionsData.results) {
      console.log(`Usando transações fornecidas: ${transactionsData.results.length}`);
      allTransactions = transactionsData.results;
    } else {
      // Fallback: fetch from API
      console.log(`Buscando transações da API para conta ${accountId}`);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const fromDate = threeMonthsAgo.toISOString().split('T')[0];
      const toDate = new Date().toISOString().split('T')[0];
      
      const transactionsResult = await callPluggyAPI(
        `/transactions?accountId=${accountId}&from=${fromDate}&to=${toDate}`, 
        'GET',
        apiKey
      );
      
      if (transactionsResult.success && transactionsResult.data.results) {
        allTransactions = transactionsResult.data.results;
      } else {
        console.warn(`Erro ao buscar transações para a conta ${accountId}:`, transactionsResult.error);
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
        duplicates: 0
      };
    }
    
    // Preparar transações formatadas para inserção
    // O trigger do banco gerará automaticamente o hash e evitará duplicatas
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
    
    console.log(`Tentando inserir ${transacoesFormatadas.length} transações`);
    
    // Inserir transações usando upsert para lidar com duplicatas de forma mais elegante
    let insertedCount = 0;
    let duplicateCount = 0;
    
    // Processar em lotes para melhor performance
    const batchSize = 100;
    for (let i = 0; i < transacoesFormatadas.length; i += batchSize) {
      const batch = transacoesFormatadas.slice(i, i + batchSize);
      
      try {
        const { data, error, count } = await supabaseClient
          .from("transacoes")
          .insert(batch)
          .select('id');
        
        if (error) {
          // Se há erro de constraint (duplicata), contar como duplicata
          if (error.code === '23505') { // unique constraint violation
            console.log(`Lote ${i / batchSize + 1}: ${batch.length} transações já existem (duplicatas)`);
            duplicateCount += batch.length;
          } else {
            console.error(`Erro ao inserir lote ${i / batchSize + 1}:`, error);
            throw error;
          }
        } else {
          const batchInserted = data ? data.length : 0;
          insertedCount += batchInserted;
          console.log(`Lote ${i / batchSize + 1}: ${batchInserted} transações inseridas`);
        }
      } catch (batchError) {
        console.error(`Erro no lote ${i / batchSize + 1}:`, batchError);
        // Tentar inserir uma por uma para identificar duplicatas específicas
        for (const tx of batch) {
          try {
            const { error: singleError } = await supabaseClient
              .from("transacoes")
              .insert([tx]);
            
            if (singleError) {
              if (singleError.code === '23505') {
                duplicateCount++;
              } else {
                console.error('Erro ao inserir transação individual:', singleError);
              }
            } else {
              insertedCount++;
            }
          } catch (singleTxError) {
            console.error('Erro individual:', singleTxError);
            duplicateCount++;
          }
        }
      }
    }
    
    console.log(`Resultado: ${insertedCount} novas transações, ${duplicateCount} duplicatas ignoradas`);
    
    // Calcular métricas apenas se houver transações novas
    if (insertedCount > 0) {
      // Buscar dados da conta para calcular métricas
      let accountData = null;
      if (!transactionsData) {
        const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
        if (accountsResult.success && accountsResult.data.results) {
          accountData = accountsResult.data.results.find((acc: any) => acc.id === accountId);
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
        
        // Atualizar métricas
        const { error: metricasError } = await supabaseClient
          .from("metricas")
          .upsert([{
            empresa_id: empresaId,
            data_referencia: new Date().toISOString().split('T')[0],
            caixa_atual: caixaAtual,
            receita_mensal: receitaMensal,
            burn_rate: burnRate,
            runway_meses: runwayMeses,
            cash_flow: cashFlow,
            mrr_growth: 0
          }], {
            onConflict: 'empresa_id,data_referencia'
          });
          
        if (metricasError) {
          console.error("Erro ao salvar métricas:", metricasError);
        } else {
          console.log("Métricas atualizadas:", { receitaMensal, burnRate, runwayMeses });
        }
        
        // Gerar insights apenas se houve mudanças significativas
        await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
      }
    }
    
    console.log("Processamento de dados financeiros concluído com sucesso");
    return {
      success: true,
      message: `${insertedCount} novas transações processadas`,
      newTransactions: insertedCount,
      duplicates: duplicateCount,
      total: allTransactions.length
    };
  } catch (error) {
    console.error("Erro ao processar dados financeiros:", error);
    throw error;
  }
}
