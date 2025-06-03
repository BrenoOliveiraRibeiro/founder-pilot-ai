
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Info, Bug, AlertCircle } from "lucide-react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { BankConnectionCard } from "@/components/open-finance/BankConnectionCard";
import { ProductionTestButton } from "@/components/open-finance/ProductionTestButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectionInstructionsAlert } from "@/components/open-finance/ConnectionInstructionsAlert";

const OpenFinance = () => {
  const {
    activeIntegrations,
    loading: integrationsLoading,
    syncing,
    handleSyncData,
    formatDate
  } = useOpenFinanceConnections();

  const {
    selectedProvider,
    setSelectedProvider,
    connecting,
    connectionProgress,
    connectionStatus,
    connectContainerRef,
    pluggyWidgetLoaded,
    providers,
    handleConnect,
    testPluggyConnection,
    debugInfo
  } = useOpenFinanceConnection();

  const { currentEmpresa, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log("OpenFinance component mounted/updated (Production Mode)");
    console.log("Current empresa:", currentEmpresa);
    console.log("Auth loading:", authLoading);
    console.log("Pluggy widget loaded:", pluggyWidgetLoaded);
  }, [currentEmpresa, authLoading, pluggyWidgetLoaded]);

  const handleTestConnection = async () => {
    await testPluggyConnection();
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Open Finance</h1>
            <p className="text-muted-foreground mt-1">
              Conecte seus dados financeiros empresariais para análises do FounderPilot AI
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              🔥 PRODUÇÃO
            </div>
          </div>
        </div>
        
        {/* Instruções de conexão */}
        <ConnectionInstructionsAlert />
        
        {/* Teste de Conexão de Produção */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Teste de Conexão - Ambiente de Produção</h3>
          <p className="text-sm text-blue-700 mb-3">
            Teste se as credenciais de produção estão funcionando corretamente antes de conectar suas contas bancárias.
          </p>
          <ProductionTestButton />
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
            <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
            <span className="text-sm font-medium">Status da integração (Produção)</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleTestConnection}
            className="text-xs"
          >
            Testar Conexão (Legacy)
          </Button>
        </div>
        
        <div className="mb-6 space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${pluggyWidgetLoaded ? 'text-green-600' : 'text-red-500'}`}>
              Pluggy Connect: {pluggyWidgetLoaded ? 'Carregado' : 'Não carregado'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${currentEmpresa ? 'text-green-600' : 'text-red-500'}`}>
              Empresa: {currentEmpresa ? currentEmpresa.nome || 'Selecionada' : 'Não selecionada'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-medium ${selectedProvider ? 'text-green-600' : 'text-red-500'}`}>
              Banco: {selectedProvider ? providers.find(p => p.id === selectedProvider)?.name || selectedProvider : 'Não selecionado'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-green-600">
              🔥 Modo: Produção (Credenciais Configuradas)
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
        
        {currentEmpresa && (
          <ActiveIntegrationsCard 
            integrations={activeIntegrations}
            handleSync={handleSyncData}
            syncing={syncing}
            formatDate={formatDate}
            loading={integrationsLoading}
          />
        )}
        
        <BankConnectionCard 
          providers={providers}
          selectedProvider={selectedProvider}
          setSelectedProvider={setSelectedProvider}
          connecting={connecting}
          connectionProgress={connectionProgress}
          connectionStatus={connectionStatus}
          pluggyWidgetLoaded={pluggyWidgetLoaded}
          useSandbox={false}
          handleConnect={handleConnect}
          connectContainerRef={connectContainerRef}
        />
      </div>
    </AppLayout>
  );
};

export default OpenFinance;
