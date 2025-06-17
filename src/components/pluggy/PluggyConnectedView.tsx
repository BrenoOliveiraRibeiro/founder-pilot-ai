
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ArrowLeft, CheckCircle, ArrowUpCircle, ArrowDownCircle, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  fetchTransactions: (accountId: string, page?: number, pageSize?: number) => Promise<any>;
}

export const PluggyConnectedView = ({ 
  connectionData, 
  processingTransactions, 
  fetchTransactions 
}: PluggyConnectedViewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 20;
  const accountData = connectionData?.accountData;

  // Auto-select first account and load transactions when account data is available
  useEffect(() => {
    if (accountData?.results && Array.isArray(accountData.results) && accountData.results.length > 0 && !selectedAccountId) {
      const firstAccountId = accountData.results[0].id;
      setSelectedAccountId(firstAccountId);
      
      // Automaticamente carregar transações da primeira conta
      handleAccountSelection(firstAccountId);
    }
  }, [accountData, selectedAccountId]);

  const handleAccountSelection = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setCurrentPage(1);
    await loadTransactions(accountId, 1);
  };

  const loadTransactions = async (accountId: string, page: number) => {
    setIsLoadingTransactions(true);
    
    try {
      const data = await fetchTransactions(accountId, page, pageSize);
      if (data) {
        setTransactionsData(data);
        // Calcular total de páginas baseado no total de resultados
        const total = data.total || data.results?.length || 0;
        setTotalPages(Math.ceil(total / pageSize));
      }
    } catch (error: any) {
      console.error('Error fetching transactions for selected account:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handlePageChange = async (page: number) => {
    if (page !== currentPage && selectedAccountId && page > 0 && page <= totalPages) {
      setCurrentPage(page);
      await loadTransactions(selectedAccountId, page);
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode || 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSelectedAccount = () => {
    if (!accountData?.results || !selectedAccountId) return null;
    return accountData.results.find((account: any) => account.id === selectedAccountId);
  };

  const selectedAccount = getSelectedAccount();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Link to="/open-finance" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Open Finance
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conta Conectada</h1>
              <p className="text-gray-600">Dados bancários sincronizados via Pluggy OpenFinance</p>
              {processingTransactions && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-600">Processando transações automaticamente...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Account Selection and Info */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Selecionar Conta</h2>
              
              {accountData?.results && accountData.results.length > 0 ? (
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
          </div>

          {/* Transactions */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Transações</h2>
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
                <div className="space-y-4">
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
                        {transactionsData.results.map((transaction: any, index: number) => (
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
                  </div>
                  
                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => handlePageChange(currentPage - 1)}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                          
                          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                            const pageNum = i + 1;
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => handlePageChange(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => handlePageChange(currentPage + 1)}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                  
                  <div className="text-center text-sm text-gray-500">
                    Página {currentPage} de {totalPages} • 
                    Mostrando {transactionsData.results.length} de {transactionsData.total || transactionsData.results.length} transações
                  </div>
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
    </div>
  );
};
