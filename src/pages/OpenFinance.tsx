import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from "@/components/layouts/AppLayout";
import { Info, Bug, AlertCircle, Shield, CreditCard, TrendingUp, CheckCircle, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { usePluggyConnectionPersistence } from "@/hooks/usePluggyConnectionPersistence";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';
import { supabase } from '@/integrations/supabase/client';
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

const OpenFinance = () => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();
  
  // Use ref to track the current instance
  const pluggyConnectInstanceRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const pageSize = 20;

  const {
    activeIntegrations,
    loading,
    syncing,
    updatingItems,
    handleSyncData,
    formatDate
  } = useOpenFinanceConnections();

  const {
    testPluggyConnection,
    debugInfo
  } = useOpenFinanceConnection();

  const { currentEmpresa, loading: authLoading } = useAuth();

  const {
    connectionData,
    loading: connectionLoading,
    processingTransactions,
    saveConnection,
    clearConnection,
    syncData,
    fetchTransactions,
    fetchAccountData,
    processAndSaveTransactions,
    autoProcessAllAccountsAllPages
  } = usePluggyConnectionPersistence();

  useEffect(() => {
    console.log("OpenFinance component mounted/updated");
    console.log("Current empresa:", currentEmpresa);
    console.log("Auth loading:", authLoading);
    console.log("Connection data:", connectionData);
  }, [currentEmpresa, authLoading, connectionData]);

  useEffect(() => {
    if (window.PluggyConnect && !scriptLoadedRef.current) {
      console.log('Pluggy Connect script already available');
      setIsScriptLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }

    if (!scriptLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js';
      script.async = true;
      script.onload = () => {
        console.log('Pluggy Connect script loaded');
        setIsScriptLoaded(true);
        scriptLoadedRef.current = true;
      };
      script.onerror = () => {
        console.error('Failed to load Pluggy Connect script');
        toast({
          title: "Erro",
          description: "Falha ao carregar o widget da Pluggy. Tente novamente.",
          variant: "destructive",
        });
      };
      document.head.appendChild(script);

      return () => {
        if (pluggyConnectInstanceRef.current) {
          try {
            pluggyConnectInstanceRef.current.destroy?.();
          } catch (error) {
            console.log('Error destroying Pluggy Connect instance:', error);
          }
          pluggyConnectInstanceRef.current = null;
        }
      };
    }
  }, [toast]);

  // Auto-selecionar primeira conta quando dados estão disponíveis
  useEffect(() => {
    if (connectionData?.accountData?.results && connectionData.accountData.results.length > 0 && !selectedAccountId) {
      const firstAccountId = connectionData.accountData.results[0].id;
      setSelectedAccountId(firstAccountId);
      handleAccountSelection(firstAccountId);
    }
  }, [connectionData?.accountData, selectedAccountId]);

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
    if (!connectionData?.accountData?.results || !selectedAccountId) return null;
    return connectionData.accountData.results.find((account: any) => account.id === selectedAccountId);
  };

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
      toast({
        title: "Erro",
        description: "Erro ao buscar transações da conta selecionada.",
        variant: "destructive",
      });
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

  // Nova função para salvar TODAS as transações de TODAS as páginas
  const handleSaveAllTransactions = async () => {
    if (!connectionData?.itemId) {
      toast({
        title: "Erro",
        description: "Nenhuma conexão bancária encontrada.",
        variant: "destructive",
      });
      return;
    }

    console.log('Iniciando salvamento completo de todas as transações...');

    try {
      const result = await autoProcessAllAccountsAllPages(connectionData.itemId, false);

      if (result && result.totalNewTransactions > 0) {
        toast({
          title: "Todas as transações processadas!",
          description: `${result.totalNewTransactions} novas transações foram salvas de ${result.totalProcessedAccounts} conta${result.totalProcessedAccounts !== 1 ? 's' : ''}.`,
        });
      } else {
        toast({
          title: "Verificação completa realizada",
          description: "Todas as transações já estão salvas no sistema.",
        });
      }
    } catch (error) {
      console.error('Error saving all transactions:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar todas as transações.",
        variant: "destructive",
      });
    }
  };

  // Nova função específica para salvar transações da página atual
  const handleSaveCurrentPageTransactions = async () => {
    if (!connectionData?.itemId || !selectedAccountId || !transactionsData) {
      toast({
        title: "Erro",
        description: "Dados insuficientes para salvar transações.",
        variant: "destructive",
      });
      return;
    }

    console.log('Iniciando salvamento de transações da página atual...');

    try {
      const result = await processAndSaveTransactions(
        connectionData.itemId,
        selectedAccountId,
        transactionsData
      );

      console.log('Resultado do salvamento da página atual:', result);

      if (result.success) {
        if (result.newTransactions && result.newTransactions > 0) {
          toast({
            title: "Transações processadas!",
            description: `${result.newTransactions} novas transações foram salvas.`,
          });
        } else {
          toast({
            title: "Nenhuma transação nova",
            description: "Todas as transações já estão salvas no sistema.",
          });
        }
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao salvar transações.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving current page transactions:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar transações da página atual.",
        variant: "destructive",
      });
    }
  };

  const handlePluggyConnect = async () => {
    if (!isScriptLoaded || !window.PluggyConnect) {
      toast({
        title: "Erro",
        description: "Widget da Pluggy ainda não foi carregado. Aguarde um momento.",
        variant: "destructive",
      });
      return;
    }

    if (pluggyConnectInstanceRef.current) {
      console.log('Destroying existing Pluggy Connect instance');
      try {
        pluggyConnectInstanceRef.current.destroy?.();
      } catch (error) {
        console.log('Error destroying previous instance:', error);
      }
      pluggyConnectInstanceRef.current = null;
    }

    setIsConnecting(true);
    console.log("Iniciando conexão com Pluggy Connect...");

    try {
      pluggyAuth.clearToken();
      
      const response = await pluggyAuth.makeAuthenticatedRequest('https://api.pluggy.ai/connect_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            clientUserId: `user_${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tokenData = await response.json();
      console.log('Connect token response:', tokenData);

      if (!tokenData.accessToken) {
        throw new Error('No access token received');
      }

      pluggyConnectInstanceRef.current = new window.PluggyConnect({
        connectToken: tokenData.accessToken,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log('Pluggy connect success!', itemData);
          console.log('Item ID:', itemData.item.id);
          
          const receivedItemId = itemData.item.id;
          
          try {
            const accountData = await fetchAccountData(receivedItemId);
            
            if (accountData) {
              // saveConnection agora inclui processamento automático completo de transações
              await saveConnection(
                receivedItemId, 
                accountData, 
                tokenData.accessToken,
                itemData.item.connector?.name || 'Banco Conectado'
              );

              if (accountData.results && accountData.results.length > 0) {
                const firstAccountId = accountData.results[0].id;
                setSelectedAccountId(firstAccountId);
                
                // Apenas buscar transações para visualização (já foram salvas automaticamente)
                await loadTransactions(firstAccountId, 1);
                
                toast({
                  title: "Conexão estabelecida!",
                  description: "Conexão realizada e todas as transações foram salvas automaticamente.",
                });
              }
            }
          } catch (error: any) {
            console.error('Erro ao processar conexão:', error);
            toast({
              title: "Erro ao processar conexão",
              description: error.message || "A conexão foi estabelecida, mas houve erro ao processar os dados.",
              variant: "destructive",
            });
          }
          
          setIsConnecting(false);
        },
        onError: (error: any) => {
          console.error('Pluggy Connect error:', error);
          setIsConnecting(false);
          toast({
            title: "Erro na conexão",
            description: "Ocorreu um erro ao conectar com o banco. Tente novamente.",
            variant: "destructive",
          });
        },
      });

      console.log('Initializing Pluggy Connect widget...');
      pluggyConnectInstanceRef.current.init();
    } catch (error) {
      console.error('Error fetching connect token or initializing Pluggy Connect:', error);
      setIsConnecting(false);
      toast({
        title: "Erro",
        description: `Falha ao obter token de conexão: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    await testPluggyConnection();
  };

  // Se estiver carregando conexão, mostrar loading
  if (connectionLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando conexão...</span>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Se já está conectado, mostrar interface conectada
  if (connectionData?.isConnected) {
    const selectedAccount = getSelectedAccount();
    
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto py-8">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Conta Conectada</h1>
                <p className="text-gray-600">Dados bancários sincronizados via Pluggy OpenFinance</p>
                {(processingTransactions || isLoadingTransactions) && (
                  <p className="text-blue-600 text-sm">
                    {processingTransactions ? 'Processando transações...' : 'Carregando transações...'}
                  </p>
                )}
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={syncData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar
                </Button>
                <Button variant="outline" size="sm" onClick={clearConnection}>
                  Desconectar
                </Button>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Account Selection and Info */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Selecionar Conta</h2>
                
                {connectionData.accountData?.results && connectionData.accountData.results.length > 0 && (
                  <div className="mb-6">
                    <Select value={selectedAccountId} onValueChange={handleAccountSelection}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Escolha uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {connectionData.accountData.results.map((account: any) => (
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

                    {/* Botão para salvar todas as transações */}
                    <div className="space-y-2">
                      <Button 
                        onClick={handleSaveAllTransactions}
                        className="w-full"
                        disabled={processingTransactions}
                        variant="default"
                      >
                        {processingTransactions ? 'Processando...' : 'Salvar Todas as Transações'}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Salva todas as transações de todas as contas e páginas
                      </p>
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
                  <div className="flex gap-2">
                    {(isLoadingTransactions || processingTransactions) && (
                      <span className="text-sm text-gray-500">
                        {processingTransactions ? 'Processando...' : 'Carregando...'}
                      </span>
                    )}
                    {transactionsData?.results && selectedAccountId && (
                      <Button 
                        size="sm" 
                        onClick={handleSaveCurrentPageTransactions}
                        disabled={processingTransactions}
                        variant="outline"
                      >
                        {processingTransactions ? 'Salvando...' : 'Salvar Página Atual'}
                      </Button>
                    )}
                  </div>
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
                            
                            {(() => {
                              const startPage = Math.max(1, currentPage - 2);
                              const endPage = Math.min(totalPages, startPage + 4);
                              const pages = [];
                              
                              for (let i = startPage; i <= endPage; i++) {
                                pages.push(
                                  <PaginationItem key={i}>
                                    <PaginationLink
                                      onClick={() => handlePageChange(i)}
                                      isActive={currentPage === i}
                                      className="cursor-pointer"
                                    >
                                      {i}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              
                              return pages;
                            })()}
                            
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
                    {selectedAccountId && !isLoadingTransactions && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-4"
                        onClick={() => handleAccountSelection(selectedAccountId)}
                      >
                        Recarregar Transações
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

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
        
        {!currentEmpresa && !authLoading && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa ter uma empresa cadastrada para usar o Open Finance. 
              Por favor, complete o cadastro da sua empresa.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-primary/80"></div>
            <span className="text-sm font-medium">Status da integração</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            className="text-xs"
          >
            Testar Conexão
          </Button>
        </div>
        
        <div className="mb-6 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${currentEmpresa ? 'text-green-600' : 'text-red-500'}`}>
              Empresa: {currentEmpresa ? currentEmpresa.nome || 'Selecionada' : 'Não selecionada'}
            </span>
          </div>
        </div>
        
        {debugInfo && (
          <Alert variant="destructive" className="mb-6">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <details>
                <summary className="cursor-pointer font-medium">Detalhes do erro (debug)</summary>
                <pre className="mt-2 text-xs bg-destructive/5 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </AlertDescription>
          </Alert>
        )}
        
        {activeIntegrations.length > 0 && (
          <ActiveIntegrationsCard 
            integrations={activeIntegrations}
            handleSync={handleSyncData}
            syncing={syncing}
            updatingItems={updatingItems}
            formatDate={formatDate}
          />
        )}
        
        <Card className="border-none shadow-md">
          <CardHeader className="border-b border-border pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Conectar com Pluggy OpenFinance</CardTitle>
                <CardDescription>
                  Use o widget oficial da Pluggy para conectar suas contas bancárias de forma segura
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <img 
                  src="https://media.licdn.com/dms/image/v2/C560BAQGbP3joPjasLw/company-logo_200_200/company-logo_200_200/0/1630665861354/pluggyai_logo?e=2147483647&v=beta&t=k1PIBzxSkL0wxz2q1R4RcjhiZ3JQhnyQQom2NQtfk1Y" 
                  alt="Pluggy" 
                  className="w-10 h-10 rounded"
                />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Integração Pluggy OpenFinance
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Conecte suas contas bancárias com segurança total usando certificação OpenFinance 
                  e criptografia de ponta a ponta.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-gray-600">Segurança Total</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-gray-600">Tempo Real</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-gray-600">Análises IA</p>
                </div>
              </div>

              <Button 
                onClick={handlePluggyConnect}
                className="w-full max-w-sm group transition-all duration-200"
                disabled={isConnecting || !isScriptLoaded}
              >
                <span className="flex items-center">
                  {isConnecting ? 'Conectando...' : 'Abrir Widget Pluggy Connect'}
                  {!isConnecting && <RefreshCw className="h-4 w-4 ml-2 transition-transform group-hover:rotate-180" />}
                </span>
              </Button>
              
              {!isScriptLoaded && (
                <p className="text-sm text-gray-500 mt-2">
                  Carregando widget da Pluggy...
                </p>
              )}
              
              <p className="text-xs text-gray-500">
                Widget oficial da Pluggy com certificação OpenFinance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OpenFinance;
