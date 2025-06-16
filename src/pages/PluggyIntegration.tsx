import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Shield, CreditCard, TrendingUp, CheckCircle, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { pluggyAuth } from '@/utils/pluggyAuth';
import { usePluggyConnectionPersistence } from '@/hooks/usePluggyConnectionPersistence';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

const PluggyIntegration = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const { toast } = useToast();
  
  const {
    connectionData,
    loading,
    processingTransactions,
    saveConnection,
    fetchTransactions,
    fetchAccountData
  } = usePluggyConnectionPersistence();
  
  // Use ref to track the current instance
  const pluggyConnectInstanceRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);

  const isConnected = connectionData?.isConnected || false;
  const accountData = connectionData?.accountData;
  const transactionsData = connectionData?.transactionsData;

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
          
          // Armazenar o itemId e buscar dados da conta
          const receivedItemId = itemData.item.id;
          const accountDataResponse = await fetchAccountData(receivedItemId);
          
          // Salvar conexão
          await saveConnection(
            receivedItemId,
            accountDataResponse,
            undefined,
            'Banco via Pluggy'
          );
          
          setIsConnecting(false);
          toast({
            title: "Conexão estabelecida!",
            description: "Sua conta bancária foi conectada com sucesso. As transações serão carregadas automaticamente.",
          });
        },
        onError: (error: any) => {
          console.error('Pluggy Connect error:', error);
          setIsConnecting(false);
          toast({
            title: "Erro na conexão",
            description: "Ocorreu um erro ao conectar com o banco. Tente novamente.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    );
  }

  if (isConnected) {
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/open-finance" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Open Finance
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <img 
                src="https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=40&h=40&fit=crop" 
                alt="Pluggy" 
                className="w-10 h-10 rounded"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Conectar com Pluggy OpenFinance
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conecte suas contas bancárias de forma segura usando o widget oficial da Pluggy
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Segurança Total</h3>
              <p className="text-sm text-gray-600">
                Certificação OpenFinance com criptografia de ponta a ponta
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Dados em Tempo Real</h3>
              <p className="text-sm text-gray-600">
                Sincronização automática de extratos e saldos
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Análises Avançadas</h3>
              <p className="text-sm text-gray-600">
                IA para insights financeiros e previsões de fluxo de caixa
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Conectar Conta Bancária
              </h2>
              <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded mb-6">
                <Shield className="w-4 h-4 inline mr-2" />
                Widget oficial da Pluggy com certificação OpenFinance.
                Suas credenciais são processadas diretamente pelo banco.
              </div>
              <Button 
                onClick={handlePluggyConnect}
                className="w-full" 
                disabled={isConnecting || !isScriptLoaded}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  'Abrir Widget Pluggy Connect'
                )}
              </Button>
              {!isScriptLoaded && (
                <p className="text-sm text-gray-500 mt-2">
                  Carregando widget da Pluggy...
                </p>
              )}
            </Card>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              <strong>Nota:</strong> Widget oficial da Pluggy com certificação OpenFinance.
              Todas as conexões são seguras e criptografadas. As transações são salvas automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PluggyIntegration;
