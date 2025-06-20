
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
  console.log(`Iniciando processamento de dados financeiros para empresa ${empresaId}, item ${itemId}, sandbox: ${sandbox}`);

  try {
    // Get API key if not provided
    let currentApiKey = apiKey;
    if (!currentApiKey) {
      const tokenResult = await getPluggyToken(pluggyClientId, pluggyClientSecret, sandbox);
      
      if (!tokenResult.success) {
        throw new Error(`Falha na autenticação com a API Pluggy: ${tokenResult.error.message}`);
      }
      
      currentApiKey = tokenResult.data.apiKey;
    }

    let accountsData;
    let allTransactions = [];

    if (transactionsData && transactionsData.results) {
      console.log(`Usando transações fornecidas: ${transactionsData.results.length}`);
      allTransactions = transactionsData.results;
      
      // Get accounts data for balance information when processing transactions
      const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', currentApiKey);
      if (accountsResult.success) {
        accountsData = accountsResult.data;
      }
    } else {
      // Fetch accounts first
      console.log(`Buscando contas para o item ${itemId}`);
      const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', currentApiKey);
      
      if (!accountsResult.success) {
        throw new Error(`Falha ao buscar contas: ${accountsResult.error.message}`);
      }
      
      accountsData = accountsResult.data;
      console.log(`Encontradas ${accountsData.results?.length || 0} contas`);

      // Fetch transactions for each account
      for (const account of accountsData.results || []) {
        if (accountId && account.id !== accountId) {
          continue; // Skip if specific account requested
        }

        console.log(`Buscando transações para conta ${account.id}`);
        const transactionsResult = await callPluggyAPI(
          `/transactions?accountId=${account.id}&pageSize=500`,
          'GET',
          currentApiKey
        );

        if (transactionsResult.success && transactionsResult.data.results) {
          allTransactions.push(...transactionsResult.data.results);
        }
      }
    }

    console.log(`Processando ${allTransactions.length} transações`);

    if (allTransactions.length === 0) {
      return {
        success: true,
        message: "Nenhuma transação encontrada para processar",
        newTransactions: 0,
        duplicates: 0,
        total: 0
      };
    }

    // Create account balance map for reference
    const accountBalanceMap = {};
    if (accountsData && accountsData.results) {
      for (const account of accountsData.results) {
        accountBalanceMap[account.id] = {
          balance: account.balance,
          currencyCode: account.currencyCode,
          name: account.name,
          type: account.type
        };
      }
    }

    // Process transactions in batches
    console.log(`Tentando inserir ${allTransactions.length} transações`);
    
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < allTransactions.length; i += batchSize) {
      batches.push(allTransactions.slice(i, i + batchSize));
    }

    let newTransactionsCount = 0;
    let duplicatesCount = 0;

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processando lote ${batchIndex + 1} de ${batches.length}: ${batch.length} transações`);

      const transactionsToInsert = batch.map(transaction => {
        const saldoConta = accountBalanceMap[transaction.accountId] || null;
        
        return {
          empresa_id: empresaId,
          descricao: transaction.description || 'Transação',
          valor: transaction.amount,
          data_transacao: transaction.date.split('T')[0],
          categoria: transaction.category || 'Outros',
          tipo: transaction.amount > 0 ? 'receita' : 'despesa',
          metodo_pagamento: transaction.paymentData?.paymentMethod || 'Outros',
          saldo_conta: saldoConta,
          transaction_hash: null // Will be set by trigger
        };
      });

      // Try batch insert first
      const { data: batchData, error: batchError } = await supabaseClient
        .from('transacoes')
        .insert(transactionsToInsert)
        .select('id');

      if (!batchError) {
        newTransactionsCount += transactionsToInsert.length;
        continue;
      }

      // If batch fails due to duplicates, process individually
      if (batchError.code === '23505') {
        console.log("Lote com duplicatas detectadas, processando individualmente...");
        
        for (const transactionData of transactionsToInsert) {
          const { data: individualData, error: individualError } = await supabaseClient
            .from('transacoes')
            .insert([transactionData])
            .select('id');

          if (!individualError) {
            newTransactionsCount++;
          } else if (individualError.code === '23505') {
            duplicatesCount++;
          } else {
            console.error(`Erro ao inserir transação individual:`, individualError);
          }
        }
      } else {
        console.error(`Erro no lote ${batchIndex + 1}:`, batchError);
        throw batchError;
      }
    }

    console.log(`Resultado final: ${newTransactionsCount} novas transações inseridas, ${duplicatesCount} duplicatas ignoradas`);

    // Update metrics and generate insights only if there are new transactions
    if (newTransactionsCount > 0) {
      console.log("Atualizando métricas e gerando insights...");
      
      // Calculate metrics
      const { data: transacoes } = await supabaseClient
        .from('transacoes')
        .select('*')
        .eq('empresa_id', empresaId);

      if (transacoes && transacoes.length > 0) {
        const receitas = transacoes.filter(t => t.tipo === 'receita');
        const despesas = transacoes.filter(t => t.tipo === 'despesa');
        
        const receitaTotal = receitas.reduce((sum, t) => sum + Math.abs(t.valor), 0);
        const despesaTotal = despesas.reduce((sum, t) => sum + Math.abs(t.valor), 0);
        const caixaAtual = receitaTotal - despesaTotal;
        
        const receitaMensal = receitas
          .filter(t => new Date(t.data_transacao) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
          
        const burnRate = despesas
          .filter(t => new Date(t.data_transacao) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, t) => sum + Math.abs(t.valor), 0);
          
        const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;

        // Update or insert metrics
        await supabaseClient
          .from('metricas')
          .upsert({
            empresa_id: empresaId,
            data_referencia: new Date().toISOString().split('T')[0],
            caixa_atual: caixaAtual,
            receita_mensal: receitaMensal,
            burn_rate: burnRate,
            runway_meses: runwayMeses,
            cash_flow: receitaMensal - burnRate
          }, {
            onConflict: 'empresa_id,data_referencia'
          });

        // Generate insights
        await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
      }
    } else {
      console.log("Nenhuma transação nova - métricas não atualizadas");
    }

    console.log("Processamento de dados financeiros concluído com sucesso");

    return {
      success: true,
      message: newTransactionsCount > 0 
        ? `${newTransactionsCount} novas transações processadas com sucesso`
        : "Todas as transações já estão atualizadas",
      newTransactions: newTransactionsCount,
      duplicates: duplicatesCount,
      total: allTransactions.length
    };

  } catch (error: any) {
    console.error("Erro no processamento de dados financeiros:", error);
    throw error;
  }
}
