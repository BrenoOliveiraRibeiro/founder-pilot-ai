
import { callPluggyAPI } from "./utils.ts";

export async function getAccountData(itemId: string, accountId: string | null, apiKey: string) {
  console.log(`Buscando dados da conta para item ${itemId}`);
  
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
        success: false,
        message: "Nenhuma conta encontrada",
        accountId: null,
        accountData: null
      };
    }
  }
  
  return {
    success: true,
    message: "Conta encontrada",
    accountId: targetAccountId,
    accountData: accountData
  };
}
