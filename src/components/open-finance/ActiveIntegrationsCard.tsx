
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Building2, Calendar, CheckCircle, Loader2, Database } from "lucide-react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { motion } from "framer-motion";

export const ActiveIntegrationsCard = () => {
  const { 
    activeIntegrations, 
    loading, 
    syncing, 
    autoSyncing,
    handleSyncData, 
    formatDate 
  } = useOpenFinanceConnections();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contas Conectadas
          </CardTitle>
          <CardDescription>Suas integrações bancárias ativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Carregando integrações...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeIntegrations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Contas Conectadas
          </CardTitle>
          <CardDescription>Suas integrações bancárias ativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma conta conectada</p>
            <p className="text-sm text-muted-foreground">
              Conecte suas contas bancárias para começar a sincronizar suas transações
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Contas Conectadas
              <Badge variant="outline">{activeIntegrations.length}</Badge>
            </CardTitle>
            <CardDescription>
              Suas integrações bancárias ativas
              {autoSyncing && (
                <span className="flex items-center gap-1 mt-1 text-blue-600">
                  <Database className="h-3 w-3 animate-pulse" />
                  Sincronizando transações automaticamente...
                </span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeIntegrations.map((integracao, index) => (
            <motion.div
              key={integracao.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{integracao.nome_banco}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Última sync: {formatDate(integracao.ultimo_sincronismo)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={integracao.status === 'ativo' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {integracao.status === 'ativo' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {integracao.status}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncData(integracao.id)}
                    disabled={syncing === integracao.id || autoSyncing}
                    className="ml-2"
                  >
                    {syncing === integracao.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {index < activeIntegrations.length - 1 && <Separator />}
            </motion.div>
          ))}
        </div>
        
        {autoSyncing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sincronização automática em andamento...</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Buscando e processando as transações mais recentes via API da Pluggy
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
