
import React from 'react';
import { usePluggyConnectionPersistence } from '@/hooks/usePluggyConnectionPersistence';
import { usePluggyWidget } from '@/hooks/usePluggyWidget';
import { PluggyIntegrationLoading } from '@/components/pluggy/PluggyIntegrationLoading';
import { PluggyConnectionHandler } from '@/components/pluggy/PluggyConnectionHandler';
import { PluggyViewRenderer } from '@/components/pluggy/PluggyViewRenderer';

const PluggyIntegration = () => {
  const {
    connectionData,
    loading,
    processingTransactions,
    saveConnection,
    fetchTransactions,
    fetchAccountData
  } = usePluggyConnectionPersistence();
  
  const {
    isConnecting,
    isScriptLoaded,
    initializePluggyConnect
  } = usePluggyWidget();

  const isConnected = connectionData?.isConnected || false;

  if (loading) {
    return <PluggyIntegrationLoading />;
  }

  return (
    <PluggyConnectionHandler
      initializePluggyConnect={initializePluggyConnect}
      saveConnection={saveConnection}
      fetchAccountData={fetchAccountData}
    >
      {(handleConnect) => (
        <PluggyViewRenderer
          connectionData={connectionData}
          isConnected={isConnected}
          isConnecting={isConnecting}
          isScriptLoaded={isScriptLoaded}
          processingTransactions={processingTransactions}
          onConnect={handleConnect}
          fetchTransactions={fetchTransactions}
        />
      )}
    </PluggyConnectionHandler>
  );
};

export default PluggyIntegration;
