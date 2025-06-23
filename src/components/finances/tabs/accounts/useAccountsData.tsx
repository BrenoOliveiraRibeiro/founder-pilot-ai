
import { useState, useEffect } from "react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useBalanceRefresh } from "@/hooks/useBalanceRefresh";

export const useAccountsData = () => {
  const {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate
  } = useOpenFinanceConnections();
  
  const { refreshBalance } = useBalanceRefresh();
  const [refreshingBalance, setRefreshingBalance] = useState<string | null>(null);
  const [updatedBalances, setUpdatedBalances] = useState<Record<string, any>>({});

  // Buscar saldos atualizados para todas as integrações ao carregar
  useEffect(() => {
    const refreshAllBalances = async () => {
      if (activeIntegrations.length === 0) return;
      
      console.log('Atualizando saldos de todas as integrações no AccountsTab...');
      
      for (const integration of activeIntegrations) {
        if (integration.item_id) {
          try {
            const updatedData = await refreshBalance(integration.item_id, false);
            if (updatedData) {
              setUpdatedBalances(prev => ({
                ...prev,
                [integration.id]: updatedData
              }));
            }
          } catch (error) {
            console.error(`Erro ao atualizar saldo da integração ${integration.id}:`, error);
          }
        }
      }
    };

    refreshAllBalances();
  }, [activeIntegrations, refreshBalance]);

  const handleRefreshIntegration = async (integration: any) => {
    if (!integration.item_id) return;
    
    setRefreshingBalance(integration.id);
    
    try {
      console.log(`Atualizando saldo da integração: ${integration.nome_banco}`);
      const updatedData = await refreshBalance(integration.item_id, true);
      
      if (updatedData) {
        setUpdatedBalances(prev => ({
          ...prev,
          [integration.id]: updatedData
        }));
      }
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
    handleSyncData,
    formatDate,
    handleRefreshIntegration
  };
};
