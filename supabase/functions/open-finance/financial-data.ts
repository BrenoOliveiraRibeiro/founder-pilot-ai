
import { callPluggyAPI } from "./utils.ts";

export async function processFinancialData(
  itemId: string,
  apiKey: string,
  sandbox: boolean = true
) {
  console.log(`Processando dados financeiros para item: ${itemId}`);
  
  try {
    // Buscar contas do item
    const accountsResult = await callPluggyAPI(`/items/${itemId}/accounts`, 'GET', apiKey, null, sandbox);
    
    if (!accountsResult.success) {
      throw new Error(`Erro ao buscar contas: ${accountsResult.error?.message}`);
    }

    const accounts = accountsResult.data?.results || [];
    console.log(`Encontradas ${accounts.length} contas`);

    let allTransactions: any[] = [];

    // Para cada conta, buscar transações
    for (const account of accounts) {
      console.log(`Buscando transações para conta: ${account.id}`);
      
      const transactionsResult = await callPluggyAPI(
        `/accounts/${account.id}/transactions`, 
        'GET', 
        apiKey, 
        null, 
        sandbox
      );

      if (transactionsResult.success && transactionsResult.data?.results) {
        const transactions = transactionsResult.data.results.map((tx: any) => ({
          ...tx,
          account_id: account.id,
          account_name: account.name,
          account_type: account.type
        }));
        
        allTransactions = allTransactions.concat(transactions);
        console.log(`Adicionadas ${transactions.length} transações da conta ${account.name}`);
      }
    }

    console.log(`Total de transações processadas: ${allTransactions.length}`);

    return {
      accounts,
      transactions: allTransactions,
      summary: {
        totalAccounts: accounts.length,
        totalTransactions: allTransactions.length,
        processedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('Erro ao processar dados financeiros:', error);
    throw error;
  }
}

export async function saveTransactionsToSupabase(
  transactions: any[],
  empresaId: string,
  supabase: any
) {
  console.log(`Salvando ${transactions.length} transações no Supabase`);
  
  if (transactions.length === 0) {
    console.log('Nenhuma transação para salvar');
    return { saved: 0 };
  }

  try {
    // Mapear transações para o formato do Supabase
    const supabaseTransactions = transactions.map(tx => ({
      empresa_id: empresaId,
      descricao: tx.description || 'Transação importada via Open Finance',
      valor: tx.amount || 0,
      data_transacao: tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      categoria: tx.category || 'Outros',
      tipo: tx.amount >= 0 ? 'receita' : 'despesa',
      metodo_pagamento: 'Open Finance'
    }));

    // Inserir transações em lotes
    const batchSize = 100;
    let savedCount = 0;

    for (let i = 0; i < supabaseTransactions.length; i += batchSize) {
      const batch = supabaseTransactions.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('transacoes')
        .insert(batch)
        .select();

      if (error) {
        console.error(`Erro ao salvar lote ${i / batchSize + 1}:`, error);
        throw error;
      }

      savedCount += data?.length || 0;
      console.log(`Lote ${i / batchSize + 1} salvo: ${data?.length || 0} transações`);
    }

    console.log(`Total de transações salvas: ${savedCount}`);
    return { saved: savedCount };

  } catch (error) {
    console.error('Erro ao salvar transações no Supabase:', error);
    throw error;
  }
}
