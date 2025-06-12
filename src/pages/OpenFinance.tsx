
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Clock, Lock, ExternalLink } from "lucide-react";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { SecurityInfoItems } from "@/components/open-finance/SecurityInfoItems";
import { TransactionsImporter } from "@/components/open-finance/TransactionsImporter";
import { BankConnectionCard } from "@/components/open-finance/BankConnectionCard";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { Link } from "react-router-dom";

const OpenFinancePage = () => {
  const { activeIntegrations, syncing, handleSyncData, formatDate } = useOpenFinanceConnections();
  const {
    selectedProvider,
    setSelectedProvider,
    connecting,
    connectionProgress,
    connectionStatus,
    connectContainerRef,
    pluggyWidgetLoaded,
    useSandbox,
    setUseSandbox,
    providers,
    handleConnect,
    testPluggyConnection,
    debugInfo
  } = useOpenFinanceConnection();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Open Finance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conecte suas contas bancárias de forma segura e automática. 
            Importe suas transações e mantenha suas finanças sempre atualizadas.
          </p>
          <div className="flex justify-center mt-4">
            <Button asChild variant="outline">
              <Link to="/pluggy-integration" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Integração Pluggy
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect">Conectar</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-6">
            <BankConnectionCard
              providers={providers}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              connecting={connecting}
              connectionProgress={connectionProgress}
              connectionStatus={connectionStatus}
              pluggyWidgetLoaded={pluggyWidgetLoaded}
              useSandbox={useSandbox}
              handleConnect={handleConnect}
              connectContainerRef={connectContainerRef}
            />
            
            {debugInfo && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800">Debug Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs text-yellow-700 overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            <ActiveIntegrationsCard 
              integrations={activeIntegrations}
              handleSync={handleSyncData}
              syncing={syncing}
              formatDate={formatDate}
            />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <TransactionsImporter />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  Segurança Open Finance
                </CardTitle>
                <CardDescription>
                  Entenda como protegemos seus dados bancários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SecurityInfoItems />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-blue-500 mb-2" />
                  <CardTitle className="text-lg">Conexão Segura</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Todas as conexões são criptografadas e seguem os padrões do Banco Central.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-green-500 mb-2" />
                  <CardTitle className="text-lg">Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Seus dados são sincronizados automaticamente e em tempo real.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Lock className="h-8 w-8 text-purple-500 mb-2" />
                  <CardTitle className="text-lg">Privacidade</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nunca armazenamos suas credenciais bancárias ou dados sensíveis.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default OpenFinancePage;
