
import React, { useState, useEffect } from 'react';
import { ConnectedViewHeader } from './connected/ConnectedViewHeader';
import { AccountSelector } from './connected/AccountSelector';
import { TransactionsTable } from './connected/TransactionsTable';
import { CacheDebugPanel } from '../debug/CacheDebugPanel';

interface ConnectionData {
  itemId: string;
  accountData: any;
  transactionsData?: any;
  isConnected: boolean;
  connectionToken?: string;
}

interface PluggyConnectedViewProps {
  connectionData: ConnectionData;
  processingTransactions: boolean;
  fetchTransactions: (accountId: string) => Promise<any>;
}

export const PluggyConnectedView = ({ 
  connectionData, 
  processingTransactions, 
  fetchTransactions 
}: PluggyConnectedViewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const accountData = connectionData?.accountData;
  const transactionsData = connectionData?.transactionsData;

  // Auto-select first account and load transactions when account data is available
  useEffect(() => {
    if (accountData?.results && Array.isArray(accountData.results) && accountData.results.length > 0 && !selectedAccountId) {
      const firstAccountId = accountData.results[0].id;
      setSelectedAccountId(firstAccountId);
      
      // Automaticamente carregar e salvar transações da primeira conta
      handleAccountSelection(firstAccountId);
    }
  }, [accountData, selectedAccountId]);

  const handleAccountSelection = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsLoadingTransactions(true);
    
    try {
      // Buscar transações - elas serão automaticamente salvas pelo hook
      await fetchTransactions(accountId);
    } catch (error: any) {
      console.error('Error fetching transactions for selected account:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <ConnectedViewHeader processingTransactions={processingTransactions} />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Account Selection and Info */}
          <div className="lg:col-span-1">
            <AccountSelector
              accountData={accountData}
              selectedAccountId={selectedAccountId}
              onAccountSelection={handleAccountSelection}
            />
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <TransactionsTable
              transactionsData={transactionsData}
              isLoadingTransactions={isLoadingTransactions}
              processingTransactions={processingTransactions}
            />
          </div>
        </div>
      </div>

      {/* Cache Debug Panel - apenas em desenvolvimento ou quando solicitado */}
      <CacheDebugPanel 
        itemId={connectionData.itemId}
        accountId={selectedAccountId}
      />
    </div>
  );
};
