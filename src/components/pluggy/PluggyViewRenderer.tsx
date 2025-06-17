
import React from 'react';
import { PluggyConnectedView } from './PluggyConnectedView';
import { PluggyConnectionView } from './PluggyConnectionView';

interface ConnectionData {
  itemId: string;
  accountData: any;
  transactionsData?: any;
  isConnected: boolean;
  connectionToken?: string;
}

interface PluggyViewRendererProps {
  connectionData: any;
  isConnected: boolean;
  isConnecting: boolean;
  isScriptLoaded: boolean;
  processingTransactions: boolean;
  onConnect: () => Promise<void>;
  fetchTransactions: (accountId: string) => Promise<any>;
}

export const PluggyViewRenderer = ({
  connectionData,
  isConnected,
  isConnecting,
  isScriptLoaded,
  processingTransactions,
  onConnect,
  fetchTransactions
}: PluggyViewRendererProps) => {
  // Check if connectionData exists and has required properties, and type-cast it properly
  if (isConnected && connectionData && connectionData.itemId && connectionData.accountData) {
    // Create a properly typed connection object for the connected view
    const typedConnectionData: ConnectionData = {
      itemId: connectionData.itemId,
      accountData: connectionData.accountData,
      transactionsData: connectionData.transactionsData,
      isConnected: connectionData.isConnected,
      connectionToken: connectionData.connectionToken,
    };

    return (
      <PluggyConnectedView
        connectionData={typedConnectionData}
        processingTransactions={processingTransactions}
        fetchTransactions={fetchTransactions}
      />
    );
  }

  return (
    <PluggyConnectionView
      isConnecting={isConnecting}
      isScriptLoaded={isScriptLoaded}
      onConnect={onConnect}
    />
  );
};
