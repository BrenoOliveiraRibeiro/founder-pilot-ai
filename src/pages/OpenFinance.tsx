
import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from "@/components/layouts/AppLayout";
import { Info, Bug, AlertCircle, Shield, CreditCard, TrendingUp, CheckCircle, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { usePluggyFinanceData } from "@/hooks/usePluggyFinanceData";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

const OpenFinance = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [itemId, setItemId] = useState<string>('');
  const [accountData, setAccountData] = useState<any>(null);
  const [transactionsData, setTransactionsData] = useState<any>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { toast } = useToast();
  
  // Use ref to track the current instance
  const pluggyConnectInstanceRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  const {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate
  } = useOpenFinanceConnections();

  const {
    testPluggyConnection,
    debugInfo
  } = useOpenFinanceConnection();

  const { processPluggyData, loading: processingData } = usePluggyFinanceData();

  const { currentEmpresa, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log("OpenFinance component mounted/updated");
    console.log("Current empresa:", currentEmpresa);
    console.log("Auth loading:", authLoading);
  }, [currentEmpresa, authLoading]);

  useEffect(() => {
    // Check if script is already loaded
    if (window.PluggyConnect && !scriptLoadedRef.current) {
      console.log('Pluggy Connect script already available');
      setIsScriptLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }

    // Only load script if not already loaded
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
        // Cleanup on unmount
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

  const fetchAccountData = async (itemId: string) => {
    try {
      console.log(`Fetching account data for item: ${itemId}`);
      const response = await pluggyAuth.makeAuthenticatedRequest(
        `https://api.pluggy.ai/accounts?itemId=${itemId}`,
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
      console.log('Account data:', data);
      setAccountData(data);
      
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        // Definir a primeira conta como selecionada por padrão
        setSelectedAccountId(data.results[0].id);
        // Buscar transações para a primeira conta
        const transactionsResponse = await fetchTransactions(data.results[0].id);
        if (transactionsResponse) {
          setTransactionsData(transactionsResponse);
          
          // Processar e salvar dados financeiros
          await processPluggyData(data.results, transactionsResponse.results || []);
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast({
        title: "Erro",
        description: "Falha ao buscar dados da conta. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleAccountSelection = async (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsLoadingTransactions(true);
    
    try {
      const transactionsResponse = await fetchTransactions(accountId);
      if (transactionsResponse) {
        setTransactionsData(transactionsResponse);
      }
    } catch (error) {
      console.error('Error fetching transactions for selected account:', error);
    } finally {
      setIsLoadingTransactions(false);
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

    // Destroy any existing instance
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
      // Clear any cached token to force fresh authentication
      pluggyAuth.clearToken();
      
      // Fetch connect token from Pluggy API using authenticated request
      const response = await pluggyAuth.makeAuthenticatedRequest('https://api.pluggy.ai/connect_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          options: {
            clientUserId: `user_${Date.now()}`, // Use unique user ID
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

      // Create new instance
      pluggyConnectInstanceRef.current = new window.PluggyConnect({
        connectToken: tokenData.accessToken,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log('Pluggy connect success!', itemData);
          console.log('Item ID:', itemData.item.id);
          
          // Armazenar o itemId
          const receivedItemId = itemData.item.id;
          setItemId(receivedItemId);
          
          // Buscar dados da conta usando o itemId
          await fetchAccountData(receivedItemId);
          
          setIsConnecting(false);
          setIsConnected(true);
          toast({
            title: "Conexão estabelecida!",
            description: "Sua conta bancária foi conectada com sucesso via Pluggy OpenFinance.",
          });
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

  if (isConnected) {
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
                {processingData && (
                  <p className="text-sm text-blue-600">Processando dados financeiros...</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Account Selection and Info */}
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

            {/* Transactions */}
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
                  src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=40&h=40&fit=crop" 
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
