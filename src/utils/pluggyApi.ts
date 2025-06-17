
import { pluggyAuth } from './pluggyAuth';

export const pluggyApi = {
  async fetchAccountData(itemId: string) {
    console.log('Fetching account data for itemId:', itemId);
    
    const response = await pluggyAuth.makeAuthenticatedRequest(
      `https://api.pluggy.ai/accounts?itemId=${itemId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Account data fetched successfully:', data);
    return data;
  },

  async fetchTransactions(accountId: string) {
    console.log('Fetching transactions for accountId:', accountId);
    
    const response = await pluggyAuth.makeAuthenticatedRequest(
      `https://api.pluggy.ai/transactions?accountId=${accountId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Transactions fetched successfully:', data);
    return data;
  }
};
