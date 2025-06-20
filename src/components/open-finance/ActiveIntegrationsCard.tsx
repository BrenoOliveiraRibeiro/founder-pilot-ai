
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle, Database } from "lucide-react";
import { IntegracaoBancaria } from "@/integrations/supabase/models";

interface ActiveIntegrationsCardProps {
  integrations: IntegracaoBancaria[];
  handleSync: (integrationId: string) => Promise<void>;
  syncing: string | null;
  formatDate: (date: string | null) => string;
}

export const ActiveIntegrationsCard = ({
  integrations,
  handleSync,
  syncing,
  formatDate
}: ActiveIntegrationsCardProps) => {
  const isRunwayCritical = (integration: IntegracaoBancaria) => {
    return integration.detalhes?.runway_meses < 3;
  };

  const getSyncButtonText = (integrationId: string) => {
    if (syncing === integrationId) {
      return "Sincronizando...";
    }
    return "Sincronizar Dados";
  };

  const getSyncButtonDescription = (integrationId: string) => {
    if (syncing === integrationId) {
      return "Atualizando saldos e transações";
    }
    return "Atualizar saldos e sincronizar transações";
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
          <div className="flex h-6 items-center gap-1 rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>Conectado</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {integrations.map((integration) => (
          <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:shadow-sm transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                {integration.nome_banco.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium">{integration.nome_banco}</h3>
                  {isRunwayCritical(integration) && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  {syncing === integration.id && (
                    <div className="flex items-center gap-1">
                      <Database className="h-3 w-3 text-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-600">Atualizando...</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {integration.tipo_conexao}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
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
            <div className="text-right">
              <Button 
                variant="outline" 
                size="sm"
                className="transition-all duration-200 hover:bg-primary/5"
                onClick={() => handleSync(integration.id)}
                disabled={syncing === integration.id}
                title={getSyncButtonDescription(integration.id)}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing === integration.id ? "animate-spin" : ""}`} />
                {getSyncButtonText(integration.id)}
              </Button>
              {syncing === integration.id && (
                <p className="text-xs text-muted-foreground mt-1">
                  Processando em 3 etapas...
                </p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
