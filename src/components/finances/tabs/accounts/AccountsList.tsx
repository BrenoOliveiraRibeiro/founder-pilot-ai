
import React from "react";
import { AccountCard } from "./AccountCard";

interface AccountsListProps {
  activeIntegrations: any[];
  updatedBalances: Record<string, any>;
  lastRefreshTime?: Record<string, Date>;
  refreshingBalance: string | null;
  syncing: string | null;
  onRefresh: (integration: any) => void;
  formatDate: (date: string | null) => string;
}

export const AccountsList: React.FC<AccountsListProps> = ({
  activeIntegrations,
  updatedBalances,
  lastRefreshTime,
  refreshingBalance,
  syncing,
  onRefresh,
  formatDate
}) => {
  return (
    <div className="space-y-4">
      {activeIntegrations.map((integration) => (
        <AccountCard
          key={integration.id}
          integration={integration}
          updatedBalances={updatedBalances}
          lastRefreshTime={lastRefreshTime}
          refreshingBalance={refreshingBalance}
          syncing={syncing}
          onRefresh={onRefresh}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};
