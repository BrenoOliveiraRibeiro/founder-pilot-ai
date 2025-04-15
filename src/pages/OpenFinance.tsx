
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Info, ExternalLink, Lock } from "lucide-react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { BankConnectionCard } from "@/components/open-finance/BankConnectionCard";

const OpenFinance = () => {
  const {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate
  } = useOpenFinanceConnections();

  const {
    selectedProvider,
    setSelectedProvider,
    connecting,
    connectionProgress,
    connectionStatus,
    connectContainerRef,
    pluggyWidgetLoaded,
    useSandbox,
    setUseSandbox,
    providers,
    handleConnect
  } = useOpenFinanceConnection();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Open Finance</h1>
            <p className="text-muted-foreground mt-1">
              Conecte seus dados financeiros para análises do FounderPilot AI
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Os dados são utilizados exclusivamente para análise
            </p>
          </div>
        </div>
        
        {activeIntegrations.length > 0 && (
          <ActiveIntegrationsCard 
            integrations={activeIntegrations}
            handleSync={handleSyncData}
            syncing={syncing}
            formatDate={formatDate}
          />
        )}
        
        <BankConnectionCard 
          providers={providers}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          connecting={connecting}
          connectionProgress={connectionProgress}
          connectionStatus={connectionStatus}
          pluggyWidgetLoaded={pluggyWidgetLoaded}
          useSandbox={useSandbox}
          handleConnect={handleConnect}
          connectContainerRef={connectContainerRef}
        />
      </div>
    </AppLayout>
  );
};

export default OpenFinance;
