
import React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface AccountCardProps {
  integration: any;
  updatedBalances: Record<string, any>;
  lastRefreshTime?: Record<string, Date>;
  refreshingBalance: string | null;
  syncing: string | null;
  onRefresh: (integration: any) => void;
  formatDate: (date: string | null) => string;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  integration,
  updatedBalances,
  lastRefreshTime = {},
  refreshingBalance,
  syncing,
  onRefresh,
  formatDate
}) => {
  const formatAccountBalance = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    
    if (!accountData?.results) return 0;
    
    // Filtrar apenas contas de débito (BANK) para o saldo total
    const debitAccounts = accountData.results.filter((account: any) => account.type === 'BANK');
    
    return debitAccounts.reduce((total: number, account: any) => {
      return total + (account.balance || 0);
    }, 0);
  };

  const getAccountsCount = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    // Contar apenas contas de débito (BANK)
    const debitAccounts = accountData?.results?.filter((account: any) => account.type === 'BANK') || [];
    return debitAccounts.length;
  };

  const getAccountsDetails = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    // Retornar apenas contas de débito (BANK)
    return accountData?.results?.filter((account: any) => account.type === 'BANK') || [];
  };

  const totalBalance = formatAccountBalance(integration);
  const accountsCount = getAccountsCount(integration);
  const accountsDetails = getAccountsDetails(integration);
  const isActive = integration.status === 'ativo';
  const isRefreshing = refreshingBalance === integration.id;
  const lastRefresh = lastRefreshTime[integration.id];
  const hasRecentUpdate = updatedBalances[integration.id];

  const getLastUpdateText = () => {
    if (lastRefresh) {
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60));
      if (diffMinutes < 1) {
        return "Atualizado agora";
      } else if (diffMinutes < 60) {
        return `Atualizado há ${diffMinutes}min`;
      } else {
        return formatDate(integration.ultimo_sincronismo);
      }
    }
    return formatDate(integration.ultimo_sincronismo);
  };

  return (
    <div className="p-4 rounded-lg border">
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
              {integration.tipo_conexao} • {accountsCount} conta{accountsCount !== 1 ? 's' : ''} de débito
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>Última sincronização: {getLastUpdateText()}</span>
              {hasRecentUpdate && (
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Saldo atualizado recentemente"></span>
              )}
            </div>
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
              onClick={() => onRefresh(integration)}
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
      
      {accountsDetails && accountsDetails.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Contas de débito:</h4>
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
};
