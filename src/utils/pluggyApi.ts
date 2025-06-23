
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

  async fetchAccountBalances(itemId: string) {
    try {
      console.log(`Buscando saldos atualizados para item ${itemId}`);
      
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
      console.log(`Saldos atualizados obtidos:`, data);
      
      // Retornar apenas os dados essenciais de saldo
      if (data.results && Array.isArray(data.results)) {
        return {
          results: data.results.map((account: any) => ({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: account.balance,
            currencyCode: account.currencyCode,
            updatedAt: new Date().toISOString()
          })),
          total: data.total || data.results.length
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar saldos das contas:', error);
      throw new Error(error.message || "Não foi possível carregar os saldos atualizados.");
    }
  },

  async fetchTransactions(accountId: string, page: number = 1, pageSize: number = 50) {
    try {
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/transactions?accountId=${accountId}&page=${page}&pageSize=${pageSize}`,
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
      console.log(`Transações carregadas (página ${page}):`, data);
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar transações:', error);
      throw new Error(error.message || "Não foi possível carregar as transações.");
    }
  }
};
