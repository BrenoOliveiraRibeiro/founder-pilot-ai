
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpCircle, ArrowDownCircle, Loader2, CreditCard } from 'lucide-react';

interface TransactionsTableProps {
  transactionsData: any;
  isLoadingTransactions: boolean;
  processingTransactions: boolean;
}

export const TransactionsTable = ({ 
  transactionsData, 
  isLoadingTransactions, 
  processingTransactions 
}: TransactionsTableProps) => {
  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode || 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Transações Recentes</h2>
        {(isLoadingTransactions || processingTransactions) && (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-500">
              {processingTransactions ? 'Salvando automaticamente...' : 'Carregando...'}
            </span>
          </div>
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
                    {formatDate(transaction.date)}
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
  );
};
