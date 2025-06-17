
import { pluggyAuth } from '@/utils/pluggyAuth';

export const pluggyApi = {
  async fetchAccountData(itemId: string) {
    try {
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/accounts?itemId=${itemId}`,
        {
          method: 'GET',
          headers: { accept: 'application/json' }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dados da conta carregados via API:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar dados da conta:', error);
      throw new Error(error.message || "Não foi possível carregar os dados da conta bancária.");
    }
  },

  async fetchTransactions(accountId: string) {
    try {
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/transactions?accountId=${accountId}`,
        {
          method: 'GET',
          headers: { accept: 'application/json' }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Transações carregadas:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      throw new Error(error.message || "Não foi possível carregar as transações.");
    }
  }
};
