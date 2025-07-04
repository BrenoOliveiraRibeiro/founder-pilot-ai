
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountsList } from "./accounts/AccountsList";
import { EmptyAccountsState } from "./accounts/EmptyAccountsState";
import { AccountsLoading } from "./accounts/AccountsLoading";
import { useAccountsData } from "./accounts/useAccountsData";

export const AccountsTab: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeIntegrations,
    loading,
    syncing,
    refreshingBalance,
    updatedBalances,
    lastRefreshTime,
    formatDate,
    handleRefreshIntegration
  } = useAccountsData();

  const handleConnectNewAccount = () => {
    navigate('/open-finance');
  };

  if (loading) {
    return <AccountsLoading />;
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
        {activeIntegrations.length > 0 ? (
          <AccountsList
            activeIntegrations={activeIntegrations}
            updatedBalances={updatedBalances}
            lastRefreshTime={lastRefreshTime}
            refreshingBalance={refreshingBalance}
            syncing={syncing}
            onRefresh={handleRefreshIntegration}
            formatDate={formatDate}
          />
        ) : (
          <EmptyAccountsState onConnectNewAccount={handleConnectNewAccount} />
        )}
      </CardContent>
    </Card>
  );
};
