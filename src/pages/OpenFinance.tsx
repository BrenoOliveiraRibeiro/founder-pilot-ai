
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Info, Bug, AlertCircle, ExternalLink } from "lucide-react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useOpenFinanceConnection } from "@/hooks/useOpenFinanceConnection";
import { ActiveIntegrationsCard } from "@/components/open-finance/ActiveIntegrationsCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const OpenFinance = () => {
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

  const { currentEmpresa, loading: authLoading } = useAuth();

  useEffect(() => {
    console.log("OpenFinance component mounted/updated");
    console.log("Current empresa:", currentEmpresa);
    console.log("Auth loading:", authLoading);
  }, [currentEmpresa, authLoading]);

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
                    <span className="text-green-600 font-semibold">✓</span>
                  </div>
                  <p className="text-gray-600">Segurança Total</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-semibold">⚡</span>
                  </div>
                  <p className="text-gray-600">Tempo Real</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-purple-600 font-semibold">📊</span>
                  </div>
                  <p className="text-gray-600">Análises IA</p>
                </div>
              </div>

              <Link to="/pluggy">
                <Button className="w-full max-w-sm group transition-all duration-200">
                  <span className="flex items-center">
                    Abrir Integração Pluggy
                    <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              
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
