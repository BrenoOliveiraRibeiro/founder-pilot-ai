
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Zap, Clock, Lock } from "lucide-react";
import { ProvidersList } from "@/components/open-finance/ProvidersList";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { SecurityInfoItems } from "@/components/open-finance/SecurityInfoItems";
import { TransactionsImporter } from "@/components/open-finance/TransactionsImporter";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";

// Mock providers data - em uma implementação real, isso viria de uma API
const mockProviders = [
  { id: "bradesco", name: "Bradesco", logo: "B", popular: true },
  { id: "itau", name: "Itaú", logo: "I", popular: true },
  { id: "santander", name: "Santander", logo: "S", popular: true },
  { id: "bb", name: "Banco do Brasil", logo: "BB", popular: false },
  { id: "cef", name: "Caixa Econômica", logo: "C", popular: false },
  { id: "nubank", name: "Nubank", logo: "N", popular: true },
];

const OpenFinancePage = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const { activeIntegrations, syncing, handleSyncData, formatDate } = useOpenFinanceConnections();

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Open Finance</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conecte suas contas bancárias de forma segura e automática. 
            Importe suas transações e mantenha suas finanças sempre atualizadas.
          </p>
        </div>

        <Tabs defaultValue="connect" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="connect">Conectar</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="import">Importar</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="connect" className="space-y-6">
            <ProvidersList 
              providers={mockProviders}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
            />
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
