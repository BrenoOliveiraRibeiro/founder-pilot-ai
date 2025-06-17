
import React from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

interface AccountSelectorProps {
  accountData: any;
  selectedAccountId: string;
  onAccountSelection: (accountId: string) => void;
}

export const AccountSelector = ({ 
  accountData, 
  selectedAccountId, 
  onAccountSelection 
}: AccountSelectorProps) => {
  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode || 'BRL'
    }).format(amount);
  };

  const getSelectedAccount = () => {
    if (!accountData?.results || !selectedAccountId) return null;
    return accountData.results.find((account: any) => account.id === selectedAccountId);
  };

  const selectedAccount = getSelectedAccount();

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Selecionar Conta</h2>
      
      {accountData?.results && accountData.results.length > 0 ? (
        <div className="mb-6">
          <Select value={selectedAccountId} onValueChange={onAccountSelection}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha uma conta" />
            </SelectTrigger>
            <SelectContent>
              {accountData.results.map((account: any) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name} - {account.type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg mb-4">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-yellow-700">Nenhuma conta encontrada</span>
        </div>
      )}

      {selectedAccount && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-gray-900">{selectedAccount.name}</h3>
            <p className="text-sm text-gray-600 capitalize">{selectedAccount.type}</p>
            <div className="mt-2">
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(selectedAccount.balance, selectedAccount.currencyCode)}
              </span>
              <p className="text-sm text-gray-500">Saldo atual</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
