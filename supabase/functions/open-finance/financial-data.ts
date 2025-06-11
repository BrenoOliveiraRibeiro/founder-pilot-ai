
import { getPluggyToken, callPluggyAPI, gerarInsights } from "./utils.ts";

export async function processFinancialData(
  empresaId: string, 
  itemId: string, 
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
    
    // 1. Fetch accounts
    const accountsResult = await callPluggyAPI(`/accounts?itemId=${itemId}`, 'GET', apiKey);
    
    if (!accountsResult.success || !accountsResult.data || !accountsResult.data.results || accountsResult.data.results.length === 0) {
      throw new Error("Nenhuma conta encontrada");
    }
    
    const accounts = accountsResult.data.results;
    console.log(`Encontradas ${accounts.length} contas`);
    
    // 2. Fetch transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const fromDate = threeMonthsAgo.toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    
    let allTransactions = [];
    
    // For each account, fetch transactions
    for (const account of accounts) {
      const transactionsResult = await callPluggyAPI(
        `/transactions?accountId=${account.id}&from=${fromDate}&to=${toDate}`, 
        'GET',
        apiKey
      );
      
      if (transactionsResult.success && transactionsResult.data.results) {
        allTransactions = [...allTransactions, ...transactionsResult.data.results];
      } else {
        console.warn(`Erro ao buscar transações para a conta ${account.id}:`, transactionsResult.error);
      }
    }
    
    console.log(`Encontradas ${allTransactions.length} transações ao total`);
    
    // 3. Calculate relevant metrics
    // Current balance (sum of account balances)
    const caixaAtual = accounts.reduce((total, account) => total + (account.balance || 0), 0);
    
    // Separate transactions into revenue and expenses
    const receitas = allTransactions.filter(tx => tx.amount > 0);
    const despesas = allTransactions.filter(tx => tx.amount < 0);
    
    // Calculate monthly revenue (average of last 3 months)
    const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(tx.amount), 0) / 3;
    
    // Calculate burn rate (average of expenses over last 3 months)
    const burnRate = Math.abs(despesas.reduce((total, tx) => total + tx.amount, 0)) / 3;
    
    // Calculate runway in months
    const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 0;
    
    // Calculate cash flow (revenue - expenses)
    const cashFlow = receitaMensal - burnRate;
    
    // Calculate MRR growth (simplified)
    const mrr_growth = 0; // Will be calculated with historical data later
    
    console.log(`Métricas calculadas: Caixa: ${caixaAtual}, Receita: ${receitaMensal}, Burn: ${burnRate}, Runway: ${runwayMeses}`);
    
    // 4. Save calculated metrics
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
      console.error("Erro ao salvar métricas:", metricasError);
      throw metricasError;
    }
    
    // 5. Clear existing transactions for this empresa to avoid duplicates
    const { error: deleteError } = await supabaseClient
      .from("transacoes")
      .delete()
      .eq('empresa_id', empresaId);
      
    if (deleteError) {
      console.warn("Aviso ao limpar transações existentes:", deleteError);
    }
    
    // 6. Save ALL transactions (not just first 50)
    if (allTransactions.length > 0) {
      const transacoesFormatadas = allTransactions.map(tx => ({
        empresa_id: empresaId,
        descricao: tx.description || 'Transação sem descrição',
        valor: tx.amount,
        data_transacao: tx.date,
        categoria: tx.category || 'Outros',
        tipo: tx.amount > 0 ? 'receita' : 'despesa',
        metodo_pagamento: tx.type || 'Transferência',
        recorrente: false // Will be determined through later analysis
      }));
      
      console.log(`Salvando ${transacoesFormatadas.length} transações formatadas`);
      
      // Insert transactions in batches to avoid timeout
      const batchSize = 100;
      for (let i = 0; i < transacoesFormatadas.length; i += batchSize) {
        const batch = transacoesFormatadas.slice(i, i + batchSize);
        const { error: txError } = await supabaseClient
          .from("transacoes")
          .insert(batch);
          
        if (txError) {
          console.error(`Erro ao salvar batch ${i + 1} de transações:`, txError);
          throw txError;
        } else {
          console.log(`Batch ${Math.floor(i / batchSize) + 1} de transações salvo com sucesso`);
        }
      }
      
      console.log(`Total de ${transacoesFormatadas.length} transações salvas com sucesso`);
    } else {
      console.log("Nenhuma transação para salvar");
    }
    
    // 7. Generate insights (business rules)
    await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
    
    console.log("Processamento de dados financeiros concluído com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao processar dados financeiros:", error);
    throw error; // Re-throw for proper handling at higher level
  }
}
