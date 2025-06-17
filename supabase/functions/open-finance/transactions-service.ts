
import { callPluggyAPI } from "./utils.ts";

export async function getTransactionsData(
  accountId: string, 
  transactionsData: any, 
  apiKey: string
) {
  console.log(`Processando dados de transações para conta ${accountId}`);
  
  let allTransactions = [];
  
  if (transactionsData && transactionsData.results) {
    console.log(`Usando transações fornecidas: ${transactionsData.results.length}`);
    allTransactions = transactionsData.results;
  } else {
    // Fetch from API
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
      console.log(`Transações obtidas da API: ${allTransactions.length}`);
    } else {
      console.warn(`Erro ao buscar transações para a conta ${accountId}:`, transactionsResult.error);
      allTransactions = [];
    }
  }
  
  return allTransactions;
}

export function formatTransactions(transactions: any[], empresaId: string) {
  return transactions.map(tx => ({
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
}
