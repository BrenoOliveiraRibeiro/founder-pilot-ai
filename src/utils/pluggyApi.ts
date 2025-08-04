
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

  async fetchBalance(itemId: string) {
    try {
      console.log(`Buscando saldo atual para item: ${itemId}`);
      
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
      console.log('Saldo atualizado carregado via API:', data);
      
      // Calcular saldo total
      const totalBalance = data.results?.reduce((sum: number, account: any) => {
        return sum + (account.balance || 0);
      }, 0) || 0;
      
      console.log(`Saldo total calculado: ${totalBalance}`);
      
      return {
        ...data,
        totalBalance
      };
    } catch (error: any) {
      console.error('Erro ao buscar saldo:', error);
      throw new Error(error.message || "Não foi possível carregar o saldo atual.");
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
  },

  async fetchItemStatus(itemId: string) {
    try {
      console.log(`Verificando status do item: ${itemId}`);
      
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/items/${itemId}`,
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
      console.log('Status do item carregado:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao verificar status do item:', error);
      throw new Error(error.message || "Não foi possível verificar o status do item.");
    }
  },

  async sendMFA(itemId: string, mfaData: { type: string; parameter?: string; value?: string }) {
    try {
      console.log(`Enviando MFA para item ${itemId}:`, mfaData);
      
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/items/${itemId}/mfa`,
        {
          method: 'POST',
          headers: { 
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(mfaData)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('MFA enviado com sucesso:', data);
      return data;
    } catch (error: any) {
      console.error('Erro ao enviar MFA:', error);
      throw new Error(error.message || "Não foi possível enviar o código MFA.");
    }
  }
};
