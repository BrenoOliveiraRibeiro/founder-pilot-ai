
import { callBelvoAPI, gerarInsights } from "./utils.ts";

export async function processFinancialData(
  empresaId: string, 
  linkId: string, 
  belvoSecretId: string, 
  belvoSecretPassword: string, 
  sandbox: boolean, 
  supabaseClient: any
) {
  try {
    console.log(`Iniciando processamento de dados financeiros para empresa ${empresaId}, link ${linkId}, sandbox: ${sandbox}`);
    
    // 1. Fetch account balances
    const accountsResult = await callBelvoAPI(`/api/accounts/?link=${linkId}`, 'GET', belvoSecretId, belvoSecretPassword, sandbox);
    
    if (!accountsResult.success || !accountsResult.data || !accountsResult.data.results || accountsResult.data.results.length === 0) {
      throw new Error("Nenhuma conta encontrada");
    }
    
    const accounts = accountsResult.data.results;
    console.log(`Encontradas ${accounts.length} contas`);
    
    // 2. Fetch transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const transactionsResult = await callBelvoAPI(
      `/api/transactions/?link=${linkId}&date_from=${threeMonthsAgo.toISOString().split('T')[0]}&date_to=${new Date().toISOString().split('T')[0]}`, 
      'GET',
      belvoSecretId,
      belvoSecretPassword,
      sandbox
    );
    
    if (!transactionsResult.success) {
      throw new Error("Falha ao buscar transações");
    }
    
    const transactions = transactionsResult.data.results || [];
    console.log(`Encontradas ${transactions.length} transações`);
    
    // 3. Calculate relevant metrics
    // Current balance (sum of account balances)
    const caixaAtual = accounts.reduce((total, account) => total + parseFloat(account.balance.current), 0);
    
    // Separate transactions into revenue and expenses
    const receitas = transactions.filter(tx => parseFloat(tx.amount) > 0);
    const despesas = transactions.filter(tx => parseFloat(tx.amount) < 0);
    
    // Calculate monthly revenue (average of last 3 months)
    const receitaMensal = receitas.reduce((total, tx) => total + Math.abs(parseFloat(tx.amount)), 0) / 3;
    
    // Calculate burn rate (average of expenses over last 3 months)
    const burnRate = Math.abs(despesas.reduce((total, tx) => total + parseFloat(tx.amount), 0)) / 3;
    
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
      throw metricasError;
    }
    
    // 5. Save relevant transactions
    const transacoesFormatadas = transactions.slice(0, 50).map(tx => ({
      empresa_id: empresaId,
      descricao: tx.description,
      valor: parseFloat(tx.amount),
      data_transacao: tx.value_date,
      categoria: tx.category || 'Outros',
      tipo: parseFloat(tx.amount) > 0 ? 'receita' : 'despesa',
      metodo_pagamento: tx.type || 'Transferência',
      recorrente: false // Will be determined through later analysis
    }));
    
    if (transacoesFormatadas.length > 0) {
      const { error: txError } = await supabaseClient
        .from("transacoes")
        .insert(transacoesFormatadas);
        
      if (txError) {
        console.error("Erro ao salvar transações:", txError);
      }
    }
    
    // 6. Generate insights (business rules)
    await gerarInsights(empresaId, runwayMeses, burnRate, receitaMensal, caixaAtual, supabaseClient);
    
    console.log("Processamento de dados financeiros concluído com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao processar dados financeiros:", error);
    throw error; // Re-throw for proper handling at higher level
  }
}
