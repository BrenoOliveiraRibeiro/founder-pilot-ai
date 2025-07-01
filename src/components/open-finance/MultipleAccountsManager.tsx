
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Plus, Building2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currencyCode: string;
}

interface Integration {
  id: string;
  nome_banco: string;
  status: string;
  account_data: any;
  ultimo_sincronismo: string | null;
}

interface MultipleAccountsManagerProps {
  integrations: Integration[];
  onAddNewAccount: () => void;
  onRefreshAccount: (integration: Integration) => void;
  refreshingBalance: string | null;
  formatDate: (date: string | null) => string;
}

export const MultipleAccountsManager: React.FC<MultipleAccountsManagerProps> = ({
  integrations,
  onAddNewAccount,
  onRefreshAccount,
  refreshingBalance,
  formatDate
}) => {
  const getTotalBalance = () => {
    return integrations.reduce((total, integration) => {
      if (integration.account_data?.results) {
        return total + integration.account_data.results.reduce((sum: number, account: Account) => {
          return sum + (account.balance || 0);
        }, 0);
      }
      return total;
    }, 0);
  };

  const getTotalAccounts = () => {
    return integrations.reduce((total, integration) => {
      return total + (integration.account_data?.results?.length || 0);
    }, 0);
  };

  const getAccountsFromIntegration = (integration: Integration): Account[] => {
    return integration.account_data?.results || [];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Contas Conectadas
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {integrations.length} {integrations.length === 1 ? 'banco conectado' : 'bancos conectados'} • {getTotalAccounts()} {getTotalAccounts() === 1 ? 'conta' : 'contas'} no total
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(getTotalBalance())}
            </div>
            <p className="text-sm text-muted-foreground">Saldo total</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {integrations.map((integration) => {
          const accounts = getAccountsFromIntegration(integration);
          const integrationBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
          const isActive = integration.status === 'ativo';
          const isRefreshing = refreshingBalance === integration.id;

          return (
            <div key={integration.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{integration.nome_banco}</h3>
                      {isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'} • 
                      Última sync: {formatDate(integration.ultimo_sincronismo)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-bold text-lg">
                      {formatCurrency(integrationBalance)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {((integrationBalance / getTotalBalance()) * 100).toFixed(1)}% do total
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRefreshAccount(integration)}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              
              {accounts.length > 0 && (
                <div className="space-y-2 pl-6 border-l-2 border-muted">
                  {accounts.slice(0, 3).map((account, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">{account.name}</span>
                        <span className="text-muted-foreground ml-2 capitalize">({account.type})</span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(account.balance || 0)}
                      </span>
                    </div>
                  ))}
                  {accounts.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{accounts.length - 3} {accounts.length - 3 === 1 ? 'conta adicional' : 'contas adicionais'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        <Button 
          onClick={onAddNewAccount}
          variant="dashed"
          className="w-full border-dashed border-2 h-16 text-muted-foreground hover:text-foreground hover:border-primary"
        >
          <Plus className="h-5 w-5 mr-2" />
          Conectar Mais Uma Conta Bancária
        </Button>
      </CardContent>
    </Card>
  );
};
