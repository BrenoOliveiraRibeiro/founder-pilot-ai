
import { getPluggyToken } from "./utils.ts";
import { getAccountData } from "./account-service.ts";
import { getTransactionsData, formatTransactions } from "./transactions-service.ts";
import { saveTransactionsBatch } from "./database-service.ts";
import { updateMetrics } from "./metrics-service.ts";

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
    const accountResult = await getAccountData(itemId, accountId, apiKey);
    if (!accountResult.success) {
      return {
        success: true,
        message: accountResult.message,
        newTransactions: 0,
        duplicates: 0,
        total: 0
      };
    }
    
    const { accountId: targetAccountId, accountData } = accountResult;
    
    // Get transactions data
    const allTransactions = await getTransactionsData(targetAccountId!, transactionsData, apiKey);
    
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
    
    // Format transactions for database
    const transacoesFormatadas = formatTransactions(allTransactions, empresaId);
    
    // Save transactions in batches
    const { insertedCount, duplicateCount } = await saveTransactionsBatch(
      transacoesFormatadas, 
      supabaseClient
    );
    
    console.log(`Resultado final: ${insertedCount} transações processadas, ${duplicateCount} duplicatas gerenciadas`);
    
    // Update metrics if there were changes
    await updateMetrics(
      empresaId, 
      insertedCount, 
      accountData, 
      itemId, 
      targetAccountId!, 
      apiKey, 
      supabaseClient
    );
    
    console.log("Processamento de dados financeiros concluído com sucesso");
    
    // Determine return message
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
