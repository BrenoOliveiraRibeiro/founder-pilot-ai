
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, AlertCircle } from "lucide-react";
import { IntegracaoBancaria } from "@/integrations/supabase/models";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActiveIntegrationsCardProps {
  integrations: IntegracaoBancaria[];
  handleSync: (integrationId: string) => Promise<void>;
  syncing: string | null;
  formatDate: (date: string | null) => string;
  loading?: boolean;
}

export const ActiveIntegrationsCard = ({
  integrations,
  handleSync,
  syncing,
  formatDate,
  loading = false
}: ActiveIntegrationsCardProps) => {
  const isRunwayCritical = (integration: IntegracaoBancaria) => {
    return integration.detalhes?.runway_meses < 3;
  };

  // Conteúdo condicional baseado no estado de carregamento e dados
  const renderContent = () => {
    if (loading) {
      return (
        <div className="py-8 text-center text-muted-foreground">
          <div className="flex justify-center mb-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
          <p>Carregando suas integrações...</p>
        </div>
      );
    }
    
    if (integrations.length === 0) {
      return (
        <Alert className="my-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você ainda não possui integrações bancárias ativas. Conecte uma conta bancária para começar.
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <div className="space-y-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                {integration.nome_banco.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium">{integration.nome_banco}</h3>
                <p className="text-xs text-muted-foreground">
                  Última sincronização: {formatDate(integration.ultimo_sincronismo)}
                </p>
                {isRunwayCritical(integration) && (
                  <div className="flex items-center gap-1 text-xs text-destructive mt-1 animate-pulse">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Runway crítico: ação necessária</span>
                  </div>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="transition-all duration-200 hover:bg-primary/5"
              onClick={() => handleSync(integration.id)}
              disabled={syncing === integration.id}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing === integration.id ? "animate-spin" : ""}`} />
              {syncing === integration.id ? "Sincronizando..." : "Sincronizar Dados"}
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="mb-8 border-none shadow-md">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Integrações Ativas</CardTitle>
            <CardDescription>
              Gerencie suas conexões de Open Finance
            </CardDescription>
          </div>
          {integrations.length > 0 && (
            <div className="flex h-6 items-center gap-1 rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Conectado</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
