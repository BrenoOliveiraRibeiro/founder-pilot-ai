
import React, { useState, useEffect } from 'react';
import { AppLayout } from "@/components/layouts/AppLayout";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { TransactionImporter } from "@/components/open-finance/TransactionImporter";
import { OpenFinanceHeader } from "@/components/open-finance/OpenFinanceHeader";
import { OpenFinanceConnectionWidget } from "@/components/open-finance/OpenFinanceConnectionWidget";
import { ConnectedAccountView } from "@/components/open-finance/ConnectedAccountView";
import { OpenFinanceStatusSection } from "@/components/open-finance/OpenFinanceStatusSection";
import { useAuth } from "@/contexts/AuthContext";

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

const OpenFinance = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [itemId, setItemId] = useState<string>('');
  const [accountData, setAccountData] = useState<any>(null);
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  const {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate
  } = useOpenFinanceConnections();

  const {
    testPluggyConnection,
    debugInfo
  } = useOpenFinanceConnection();

  const { currentEmpresa, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log("OpenFinance component mounted/updated");
    console.log("Current empresa:", currentEmpresa);
    console.log("Auth loading:", authLoading);
  }, [currentEmpresa, authLoading]);

  const handleConnectionSuccess = async (receivedItemId: string, receivedAccountData: any) => {
    setItemId(receivedItemId);
    setAccountData(receivedAccountData);
    setIsConnected(true);
    
    if (receivedAccountData?.results && Array.isArray(receivedAccountData.results) && receivedAccountData.results.length > 0) {
      setSelectedAccountId(receivedAccountData.results[0].id);
      // Initial transactions will be loaded by ConnectedAccountView
    }
  };

  const handleAccountChange = (accountId: string, transactionsResponse: any) => {
    setSelectedAccountId(accountId);
    setTransactionsData(transactionsResponse);
  };

  if (isConnected) {
    return (
      <AppLayout>
        <ConnectedAccountView
          itemId={itemId}
          accountData={accountData}
          transactionsData={transactionsData}
          selectedAccountId={selectedAccountId}
          onAccountChange={handleAccountChange}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <OpenFinanceHeader />
        
        <OpenFinanceStatusSection
          currentEmpresa={currentEmpresa}
          authLoading={authLoading}
          handleTestConnection={testPluggyConnection}
          debugInfo={debugInfo}
        />
        
        {activeIntegrations.length > 0 && (
          <ActiveIntegrationsCard 
            integrations={activeIntegrations}
            handleSync={handleSyncData}
            syncing={syncing}
            formatDate={formatDate}
          />
        )}

        <div className="mb-6">
          <TransactionImporter />
        </div>
        
        <OpenFinanceConnectionWidget onConnectionSuccess={handleConnectionSuccess} />
      </div>
    </AppLayout>
  );
};

export default OpenFinance;
