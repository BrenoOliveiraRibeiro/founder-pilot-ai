
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { RefreshCw, CheckCircle, AlertCircle, CreditCard, Wallet } from "lucide-react";
import { isDebitAccount, isCreditAccount, formatAccountType } from "@/utils/accountSeparation";

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
    
    return accountData.results.reduce((total: number, account: any) => {
      return total + (account.balance || 0);
    }, 0);
  };

  const getCreditInfo = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    
    if (!accountData?.results) return { totalLimit: 0, usedLimit: 0, availableLimit: 0 };
    
    const creditAccounts = accountData.results.filter((account: any) => 
      isCreditAccount(account.type)
    );
    
    const totalLimit = creditAccounts.reduce((sum: number, account: any) => 
      sum + (account.credit_limit || 0), 0
    );
    
    const usedLimit = creditAccounts.reduce((sum: number, account: any) => 
      sum + Math.abs(account.balance || 0), 0
    );
    
    return {
      totalLimit,
      usedLimit,
      availableLimit: totalLimit - usedLimit
    };
  };

  const getAccountTypeBreakdown = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    
    if (!accountData?.results) return { debit: [], credit: [] };
    
    const debit = accountData.results.filter((account: any) => isDebitAccount(account.type));
    const credit = accountData.results.filter((account: any) => isCreditAccount(account.type));
    
    return { debit, credit };
  };

  const getAccountsCount = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    return accountData?.results?.length || 0;
  };

  const getAccountsDetails = (integration: any) => {
    const accountData = updatedBalances[integration.id] || integration.account_data;
    return accountData?.results || [];
  };

  const totalBalance = formatAccountBalance(integration);
  const accountsCount = getAccountsCount(integration);
  const accountsDetails = getAccountsDetails(integration);
  const creditInfo = getCreditInfo(integration);
  const accountTypeBreakdown = getAccountTypeBreakdown(integration);
  const isActive = integration.status === 'ativo';
  const isRefreshing = refreshingBalance === integration.id;
  const lastRefresh = lastRefreshTime[integration.id];
  const hasRecentUpdate = updatedBalances[integration.id];
  
  const hasDebitAccounts = accountTypeBreakdown.debit.length > 0;
  const hasCreditAccounts = accountTypeBreakdown.credit.length > 0;

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
              {integration.tipo_conexao} • {accountsCount} conta{accountsCount !== 1 ? 's' : ''}
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
          <div className="space-y-2">
            {hasDebitAccounts && (
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-600" />
                <div>
                  <div className="font-bold text-green-600">
                    {formatCurrency(
                      accountTypeBreakdown.debit.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0)
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">Saldo Real</div>
                </div>
              </div>
            )}
            
            {hasCreditAccounts && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <div>
                  <div className="font-bold text-blue-600">
                    {formatCurrency(creditInfo.availableLimit)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Limite Disponível
                  </div>
                </div>
              </div>
            )}
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
        <div className="mt-4 pt-4 border-t space-y-3">
          {/* Contas de Débito */}
          {hasDebitAccounts && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-green-600" />
                Contas de Débito ({accountTypeBreakdown.debit.length})
              </h4>
              <div className="grid gap-2">
                {accountTypeBreakdown.debit.slice(0, 2).map((account: any, index: number) => (
                  <div key={`debit-${index}`} className="flex justify-between items-center text-sm p-2 bg-green-50 rounded border border-green-200">
                    <div>
                      <span className="font-medium">{account.name}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {formatAccountType(account.type)}
                      </Badge>
                    </div>
                    <span className="font-medium text-green-600">
                      {formatCurrency(account.balance || 0)}
                    </span>
                  </div>
                ))}
                {accountTypeBreakdown.debit.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{accountTypeBreakdown.debit.length - 2} contas adicionais
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contas de Crédito */}
          {hasCreditAccounts && (
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-600" />
                Cartões de Crédito ({accountTypeBreakdown.credit.length})
              </h4>
              <div className="grid gap-2">
                {accountTypeBreakdown.credit.slice(0, 2).map((account: any, index: number) => {
                  const usedAmount = Math.abs(account.balance || 0);
                  const limit = account.credit_limit || 0;
                  const available = limit - usedAmount;
                  const usagePercentage = limit > 0 ? (usedAmount / limit) * 100 : 0;
                  
                  return (
                    <div key={`credit-${index}`} className="text-sm p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium">{account.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {formatAccountType(account.type)}
                          </Badge>
                        </div>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(available)} disponível
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Usado: {formatCurrency(usedAmount)}</span>
                        <span>Limite: {formatCurrency(limit)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className={`h-1.5 rounded-full ${
                            usagePercentage > 80 ? 'bg-red-500' : 
                            usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {accountTypeBreakdown.credit.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{accountTypeBreakdown.credit.length - 2} cartões adicionais
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
