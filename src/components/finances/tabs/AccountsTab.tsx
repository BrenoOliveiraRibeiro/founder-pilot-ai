
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useBalanceRefresh } from "@/hooks/useBalanceRefresh";
import { RefreshCw, Plus, AlertCircle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const AccountsTab: React.FC = () => {
  const navigate = useNavigate();
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

  const formatAccountBalance = (integration: any) => {
    // Usar dados atualizados se disponíveis, senão usar dados originais
    const accountData = updatedBalances[integration.id] || integration.account_data;
    
    if (!accountData?.results) return 0;
    
    // Calcular saldo total de todas as contas
    return accountData.results.reduce((total: number, account: any) => {
      return total + (account.balance || 0);
    }, 0);
  };

  const getAccountsCount = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    return accountData?.results?.length || 0;
  };

  const getAccountsDetails = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    return accountData?.results || [];
  };

  const handleConnectNewAccount = () => {
    navigate('/open-finance');
  };

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias Conectadas</CardTitle>
          <CardDescription>Saldos atuais das contas bancárias integradas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="text-right space-y-2">
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Contas Bancárias Conectadas</CardTitle>
            <CardDescription>
              Saldos atuais das contas bancárias integradas via Open Finance
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnectNewAccount}
          >
            <Plus className="h-4 w-4 mr-2" />
            Conectar Conta
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeIntegrations.length > 0 ? (
            activeIntegrations.map((integration) => {
              const totalBalance = formatAccountBalance(integration);
              const accountsCount = getAccountsCount(integration);
              const accountsDetails = getAccountsDetails(integration);
              const isActive = integration.status === 'ativo';
              const isRefreshing = refreshingBalance === integration.id;
              
              return (
                <div key={integration.id} className="p-4 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        isActive ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{integration.nome_banco}</h3>
                          {isActive ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.tipo_conexao} • {accountsCount} conta{accountsCount !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Última sincronização: {formatDate(integration.ultimo_sincronismo)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">
                        {formatCurrency(totalBalance)}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRefreshIntegration(integration)}
                          disabled={isRefreshing || syncing === integration.id}
                        >
                          {isRefreshing ? (
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <RefreshCw className="h-3 w-3 mr-1" />
                          )}
                          {isRefreshing ? 'Atualizando...' : 'Atualizar Saldo'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Detalhes das contas individuais */}
                  {accountsDetails && accountsDetails.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-2">Contas detalhadas:</h4>
                      <div className="grid gap-2">
                        {accountsDetails.slice(0, 3).map((account: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <div>
                              <span className="font-medium">{account.name}</span>
                              <span className="text-muted-foreground ml-2 capitalize">
                                ({account.type})
                              </span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(account.balance || 0)}
                            </span>
                          </div>
                        ))}
                        {accountsDetails.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center py-1">
                            +{accountsDetails.length - 3} contas adicionais
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="border border-dashed rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhuma conta bancária conectada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Conecte suas contas bancárias via Open Finance para ver saldos e transações em tempo real
              </p>
              <Button onClick={handleConnectNewAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Conectar Primeira Conta
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
