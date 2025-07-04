
import { useState, useEffect, useCallback } from "react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useBalanceRefresh } from "@/hooks/useBalanceRefresh";

export const useAccountsData = () => {
  const {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate,
    fetchIntegrations
  } = useOpenFinanceConnections();
  
  const { refreshBalance } = useBalanceRefresh();
  const [refreshingBalance, setRefreshingBalance] = useState<string | null>(null);
  const [updatedBalances, setUpdatedBalances] = useState<Record<string, any>>({});
  const [lastRefreshTime, setLastRefreshTime] = useState<Record<string, Date>>({});

  // Função para atualizar saldo com callback de sucesso
  const refreshIntegrationBalance = useCallback(async (integration: any, showToast: boolean = false) => {
    if (!integration.item_id) return null;
    
    const updatedData = await refreshBalance(
      integration.item_id, 
      showToast,
      (data) => {
        // Callback executado imediatamente quando dados são atualizados
        setUpdatedBalances(prev => ({
          ...prev,
          [integration.id]: data
        }));
        setLastRefreshTime(prev => ({
          ...prev,
          [integration.id]: new Date()
        }));
      }
    );
    
    return updatedData;
  }, [refreshBalance]);

  // Buscar saldos atualizados para todas as integrações ao carregar
  useEffect(() => {
    const refreshAllBalances = async () => {
      if (activeIntegrations.length === 0) return;
      
      console.log('Atualizando saldos de todas as integrações no AccountsTab...');
      
      // Usar Promise.allSettled para não falhar se uma integração der erro
      const refreshPromises = activeIntegrations.map(async (integration) => {
        if (integration.item_id) {
          try {
            await refreshIntegrationBalance(integration, false);
          } catch (error) {
            console.error(`Erro ao atualizar saldo da integração ${integration.id}:`, error);
          }
        }
      });
      
      await Promise.allSettled(refreshPromises);
      
      // Após todas as atualizações, buscar integrações novamente para sincronizar
      setTimeout(() => {
        fetchIntegrations();
      }, 1000);
    };

    if (activeIntegrations.length > 0 && Object.keys(updatedBalances).length === 0) {
      refreshAllBalances();
    }
  }, [activeIntegrations, refreshIntegrationBalance, fetchIntegrations, updatedBalances]);

  // Auto-refresh a cada 5 minutos para manter dados atualizados
  useEffect(() => {
    if (activeIntegrations.length === 0) return;

    const interval = setInterval(() => {
      console.log('Auto-refresh dos saldos...');
      activeIntegrations.forEach(async (integration) => {
        if (integration.item_id) {
          try {
            await refreshIntegrationBalance(integration, false);
          } catch (error) {
            console.error(`Erro no auto-refresh da integração ${integration.id}:`, error);
          }
        }
      });
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [activeIntegrations, refreshIntegrationBalance]);

  const handleRefreshIntegration = async (integration: any) => {
    if (!integration.item_id) return;
    
    setRefreshingBalance(integration.id);
    
    try {
      console.log(`Atualizando saldo da integração: ${integration.nome_banco}`);
      await refreshIntegrationBalance(integration, true);
      
      // Após refresh bem-sucedido, atualizar lista de integrações
      setTimeout(() => {
        fetchIntegrations();
      }, 500);
    } catch (error) {
      console.error(`Erro ao atualizar saldo da integração ${integration.id}:`, error);
    } finally {
      setRefreshingBalance(null);
    }
  };

  return {
    activeIntegrations,
    loading,
    syncing,
    refreshingBalance,
    updatedBalances,
    lastRefreshTime,
    handleSyncData,
    formatDate,
    handleRefreshIntegration
  };
};
