
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trash2, RefreshCw, Plus, Building2, CreditCard, ArrowRight, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { MultiplePluggyConnection } from '@/hooks/useMultiplePluggyDatabase';

interface MultipleConnectionsManagerProps {
  connections: MultiplePluggyConnection[];
  allAccountData: any;
  selectedAccountId: string;
  onAccountSelect: (accountId: string) => void;
  onSyncAll: () => void;
  onClearConnection: (itemId: string) => void;
  onAddNewBank: () => void;
  syncing?: boolean;
}

export const MultipleConnectionsManager: React.FC<MultipleConnectionsManagerProps> = ({
  connections,
  allAccountData,
  selectedAccountId,
  onAccountSelect,
  onSyncAll,
  onClearConnection,
  onAddNewBank,
  syncing = false
}) => {
  // Debug logging for balance issues
  React.useEffect(() => {
    if (allAccountData?.results) {
      console.log('🔍 DEBUG: Dados das contas recebidos:', {
        totalAccounts: allAccountData.results.length,
        accounts: allAccountData.results.map((acc: any) => ({
          id: acc.id,
          name: acc.name,
          bankName: acc.bankName,
          balance: acc.balance,
          type: acc.type,
          currencyCode: acc.currencyCode
        }))
      });

      // Verificar especificamente a Caixa Econômica
      const caixaAccounts = allAccountData.results.filter((acc: any) => 
        acc.bankName?.toLowerCase().includes('caixa') || 
        acc.name?.toLowerCase().includes('caixa')
      );
      
      if (caixaAccounts.length > 0) {
        console.log('🏦 DEBUG: Contas da Caixa Econômica encontradas:', caixaAccounts);
      }
    }
  }, [allAccountData]);

  const totalBalance = allAccountData?.results?.reduce(
    (sum: number, account: any) => {
      const balance = account.balance || 0;
      console.log(`💰 Somando conta ${account.name} (${account.bankName}): ${balance}`);
      return sum + balance;
    }, 
    0
  ) || 0;

  console.log('💰 DEBUG: Saldo total calculado:', totalBalance);

  const selectedAccount = allAccountData?.results?.find(
    (account: any) => account.id === selectedAccountId
  );

  const getConnectionStats = () => {
    const totalAccounts = allAccountData?.results?.length || 0;
    const bankNames = connections.map(conn => conn.bankName);
    return { totalAccounts, bankNames };
  };

  const { totalAccounts, bankNames } = getConnectionStats();

  const handleRefreshConnection = async (itemId: string, bankName: string) => {
    console.log(`🔄 Sincronizando especificamente: ${bankName} (${itemId})`);
    // Trigger sync for specific connection - this will be handled by parent component
    onSyncAll(); // For now, sync all, but we could make this more specific
  };

  return (
    <div className="space-y-6">
      {/* Debug Info Card - só mostra em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-orange-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Debug Info (Dev Mode)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-orange-700 space-y-1">
              <p>Total de conexões: {connections.length}</p>
              <p>Total de contas: {totalAccounts}</p>
              <p>Saldo total calculado: {formatCurrency(totalBalance)}</p>
              {selectedAccount && (
                <p>Conta selecionada: {selectedAccount.name} - {formatCurrency(selectedAccount.balance)}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo das Conexões */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Suas Conexões Open Finance</CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSyncAll}
                disabled={syncing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sincronizar Tudo
              </Button>
              <Button 
                size="sm" 
                onClick={onAddNewBank}
              >
                <Plus className="h-4 w-4 mr-2" />
                Conectar Banco
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-sm text-gray-600">Saldo Total</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {connections.length}
              </div>
              <p className="text-sm text-gray-600">Bancos Conectados</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {totalAccounts}
              </div>
              <p className="text-sm text-gray-600">Contas Totais</p>
            </div>
          </div>
          
          {bankNames.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Bancos conectados:</p>
              <div className="flex flex-wrap gap-2">
                {bankNames.map((bankName, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {bankName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Conexões Individuais com Refresh Individual */}
      {connections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gerenciar Conexões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connections.map((connection) => {
                const connectionAccounts = allAccountData?.results?.filter(
                  (account: any) => account.itemId === connection.itemId
                ) || [];
                
                const connectionBalance = connectionAccounts.reduce(
                  (sum: number, account: any) => {
                    const balance = account.balance || 0;
                    console.log(`🏦 ${connection.bankName} - Conta ${account.name}: ${balance}`);
                    return sum + balance;
                  }, 
                  0
                );

                console.log(`🏦 ${connection.bankName} - Saldo total da conexão: ${connectionBalance}`);

                return (
                  <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">{connection.bankName}</p>
                        <p className="text-sm text-gray-600">
                          {connectionAccounts.length} conta{connectionAccounts.length !== 1 ? 's' : ''} • 
                          {formatCurrency(connectionBalance)}
                        </p>
                        {/* Debug info for Caixa */}
                        {connection.bankName.toLowerCase().includes('caixa') && (
                          <p className="text-xs text-orange-600">
                            Debug: {connectionAccounts.map(acc => 
                              `${acc.name}(${formatCurrency(acc.balance)})`
                            ).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {connection.lastSync ? 
                          `Sync: ${new Date(connection.lastSync).toLocaleDateString('pt-BR')}` :
                          'Nunca sincronizado'
                        }
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRefreshConnection(connection.itemId, connection.bankName)}
                        disabled={syncing}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onClearConnection(connection.itemId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seletor de Conta com Debug */}
      {allAccountData?.results && allAccountData.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecionar Conta para Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedAccountId} onValueChange={onAccountSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Escolha uma conta para ver transações" />
                </SelectTrigger>
                <SelectContent>
                  {allAccountData.results.map((account: any) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center gap-2 w-full">
                        <CreditCard className="h-4 w-4" />
                        <span className="flex-1">
                          {account.name} • {account.bankName}
                        </span>
                        <ArrowRight className="h-3 w-3 mx-2" />
                        <span className="font-semibold">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedAccount && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedAccount.bankName}</span>
                  </div>
                  <h3 className="font-medium text-gray-900">{selectedAccount.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{selectedAccount.type}</p>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedAccount.balance)}
                    </span>
                    <p className="text-sm text-gray-500">Saldo atual</p>
                  </div>
                  {/* Debug info específico da conta selecionada */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <p><strong>Debug:</strong></p>
                      <p>ID: {selectedAccount.id}</p>
                      <p>Item ID: {selectedAccount.itemId}</p>
                      <p>Balance (raw): {selectedAccount.balance}</p>
                      <p>Currency: {selectedAccount.currencyCode || 'BRL'}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
