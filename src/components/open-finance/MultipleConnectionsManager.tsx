
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Trash2, RefreshCw, Plus, Building2, CreditCard, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { MultiplePluggyConnection } from '@/hooks/useMultiplePluggyDatabase';

interface MultipleConnectionsManagerProps {
  connections: MultiplePluggyConnection[];
  allAccountData: any;
  selectedAccountId: string;
  refreshingBalance?: string | null;
  updatedBalances?: Record<string, any>;
  lastRefreshTime?: Record<string, Date>;
  onAccountSelect: (accountId: string) => void;
  onSyncAll: () => void;
  onClearConnection: (itemId: string) => void;
  onAddNewBank: () => void;
  onRefreshConnection?: (connection: MultiplePluggyConnection) => void;
  syncing?: boolean;
}

export const MultipleConnectionsManager: React.FC<MultipleConnectionsManagerProps> = ({
  connections,
  allAccountData,
  selectedAccountId,
  refreshingBalance,
  updatedBalances = {},
  lastRefreshTime = {},
  onAccountSelect,
  onSyncAll,
  onClearConnection,
  onAddNewBank,
  onRefreshConnection,
  syncing = false
}) => {
  const totalBalance = allAccountData?.results?.reduce(
    (sum: number, account: any) => sum + (account.balance || 0), 
    0
  ) || 0;

  const selectedAccount = allAccountData?.results?.find(
    (account: any) => account.id === selectedAccountId
  );

  const getConnectionStats = () => {
    const totalAccounts = allAccountData?.results?.length || 0;
    const bankNames = connections.map(conn => conn.bankName);
    return { totalAccounts, bankNames };
  };

  const { totalAccounts, bankNames } = getConnectionStats();

  return (
    <div className="space-y-6">
      {/* Resumo das Conexões */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Suas Conexões Open Finance</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onSyncAll}
                disabled={syncing}
                className="w-full sm:w-auto"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sincronizar Tudo
              </Button>
              <Button 
                size="sm" 
                onClick={onAddNewBank}
                className="w-full sm:w-auto"
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

      {/* Lista de Conexões Individuais */}
      {connections.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Gerenciar Conexões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {connections.map((connection) => {
              // Usar dados atualizados se disponível, senão usar cache
              const accountData = updatedBalances[connection.id] || (
                allAccountData?.results?.filter(
                  (account: any) => account.itemId === connection.itemId
                )
              );
              
              const connectionAccounts = Array.isArray(accountData) 
                ? accountData 
                : (accountData?.results || []);
              
              const connectionBalance = connectionAccounts.reduce(
                (sum: number, account: any) => sum + (account.balance || 0), 
                0
              );

              const isRefreshing = refreshingBalance === connection.id;
              const lastRefresh = lastRefreshTime[connection.id];
              const hasRecentUpdate = updatedBalances[connection.id];

              const getLastUpdateText = () => {
                if (lastRefresh) {
                  const now = new Date();
                  const diffMinutes = Math.floor((now.getTime() - lastRefresh.getTime()) / (1000 * 60));
                  if (diffMinutes < 1) {
                    return "Atualizado agora";
                  } else if (diffMinutes < 60) {
                    return `Atualizado há ${diffMinutes}min`;
                  } else {
                    const hours = Math.floor(diffMinutes / 60);
                    return `Atualizado há ${hours}h`;
                  }
                }
                return connection.lastSync ? 
                  `Sync: ${new Date(connection.lastSync).toLocaleDateString('pt-BR')}` :
                  'Nunca sincronizado';
              };

              return (
                <div key={connection.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg bg-gray-50/50">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      {hasRecentUpdate && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 mb-1">{connection.bankName}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {connectionAccounts.length} conta{connectionAccounts.length !== 1 ? 's' : ''} • 
                        {formatCurrency(connectionBalance)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getLastUpdateText()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {onRefreshConnection && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRefreshConnection(connection)}
                        disabled={isRefreshing}
                        className="text-xs whitespace-nowrap"
                      >
                        {isRefreshing ? (
                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-3 w-3 mr-1" />
                        )}
                        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                      </Button>
                    )}
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
          </CardContent>
        </Card>
      )}

      {/* Seletor de Conta */}
      {allAccountData?.results && allAccountData.results.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Selecionar Conta para Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={selectedAccountId} onValueChange={onAccountSelect}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Escolha uma conta para ver transações" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {allAccountData.results.map((account: any) => (
                    <SelectItem key={account.id} value={account.id} className="p-3">
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <CreditCard className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="block truncate font-medium">
                            {account.name}
                          </span>
                          <span className="block text-xs text-gray-500 truncate">
                            {account.bankName}
                          </span>
                        </div>
                        <ArrowRight className="h-3 w-3 mx-2 flex-shrink-0" />
                        <span className="font-semibold text-sm flex-shrink-0">
                          {formatCurrency(account.balance)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedAccount && (
                <div className="p-5 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">{selectedAccount.bankName}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{selectedAccount.name}</h3>
                  <p className="text-sm text-gray-600 capitalize mb-3">{selectedAccount.type}</p>
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(selectedAccount.balance)}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">Saldo atual</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
