
import React, { useState } from 'react';
import { CheckCircle, ArrowUpCircle, ArrowDownCircle, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TransactionImporter } from './TransactionImporter';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

interface ConnectedAccountViewProps {
  itemId: string;
  accountData: any;
  transactionsData: any;
  selectedAccountId: string;
  onAccountChange: (accountId: string, transactionsData: any) => void;
}

export const ConnectedAccountView = ({ 
  itemId, 
  accountData, 
  transactionsData, 
  selectedAccountId, 
  onAccountChange 
}: ConnectedAccountViewProps) => {
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = async (accountId: string) => {
    try {
      console.log(`Fetching transactions for account: ${accountId}`);
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/transactions?accountId=${accountId}`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Transactions data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar transações. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleAccountSelection = async (accountId: string) => {
    setIsLoadingTransactions(true);
    
    try {
      const transactionsResponse = await fetchTransactions(accountId);
      if (transactionsResponse) {
        onAccountChange(accountId, transactionsResponse);
      }
    } catch (error) {
      console.error('Error fetching transactions for selected account:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode || 'BRL'
    }).format(amount);
  };

  const formatDateTransaction = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSelectedAccount = () => {
    if (!accountData?.results || !selectedAccountId) return null;
    return accountData.results.find((account: any) => account.id === selectedAccountId);
  };

  const selectedAccount = getSelectedAccount();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conta Conectada</h1>
            <p className="text-gray-600">Dados bancários sincronizados via Pluggy OpenFinance</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <TransactionImporter />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Selecionar Conta</h2>
            
            {accountData?.results && accountData.results.length > 0 && (
              <div className="mb-6">
                <Select value={selectedAccountId} onValueChange={handleAccountSelection}>
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
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Transações Recentes</h2>
              {isLoadingTransactions && (
                <span className="text-sm text-gray-500">Carregando...</span>
              )}
            </div>

            {transactionsData?.results && transactionsData.results.length > 0 ? (
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData.results.slice(0, 10).map((transaction: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatDateTransaction(transaction.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {transaction.amount > 0 ? (
                              <ArrowUpCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <ArrowDownCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="truncate max-w-xs" title={transaction.description}>
                              {transaction.description || 'Transação'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {transaction.category || 'Outros'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(Math.abs(transaction.amount), transaction.currencyCode || 'BRL')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {transactionsData.results.length > 10 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                      Mostrando 10 de {transactionsData.results.length} transações
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {isLoadingTransactions ? 'Carregando transações...' : 'Nenhuma transação encontrada'}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
