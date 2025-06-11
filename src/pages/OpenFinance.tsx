
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { PluggyButton } from "@/components/pluggy/PluggyButton";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Loader2, PlusCircle, RefreshCw, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { usePluggyFinanceData } from "@/hooks/usePluggyFinanceData";

interface Integration {
  id: string;
  nome_banco: string;
  tipo_conexao: string;
  status: string;
  detalhes: any;
  ultimo_sincronismo: string;
}

const OpenFinancePage = () => {
  const [connecting, setConnecting] = useState(false);
  const { currentEmpresa } = useAuth();
  const { activeIntegrations, fetchIntegrations } = useOpenFinanceConnections();
  const [isSyncing, setIsSyncing] = useState(false);
  const { processPluggyData } = usePluggyFinanceData();

  // Função para processar dados do Pluggy após conexão bem-sucedida
  const handlePluggySuccess = async (item: any) => {
    try {
      setConnecting(true);
      
      // Buscar contas conectadas
      const accountsResponse = await fetch('/api/pluggy/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${item.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!accountsResponse.ok) {
        throw new Error('Erro ao buscar contas');
      }
      
      const accountsData = await accountsResponse.json();
      
      // Buscar transações para cada conta
      let allTransactions = [];
      
      for (const account of accountsData.results || []) {
        const transactionsResponse = await fetch(`/api/pluggy/accounts/${account.id}/transactions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${item.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          allTransactions.push(...(transactionsData.results || []));
        }
      }
      
      // Processar e salvar dados
      await processPluggyData(accountsData.results || [], {
        total: allTransactions.length,
        totalPages: 1,
        page: 1,
        results: allTransactions
      });
      
      // Salvar integração no banco
      if (currentEmpresa?.id) {
        const { error } = await supabase
          .from('integracoes_bancarias')
          .insert({
            empresa_id: currentEmpresa.id,
            nome_banco: item.connector?.name || 'Pluggy',
            tipo_conexao: 'pluggy',
            status: 'ativa',
            detalhes: {
              itemId: item.id,
              accessToken: item.accessToken,
              accountsCount: accountsData.results?.length || 0,
              transactionsCount: allTransactions.length
            },
            ultimo_sincronismo: new Date().toISOString()
          });

        if (error) {
          console.error('Erro ao salvar integração:', error);
        }
      }
      
      toast({
        title: "Sucesso!",
        description: `Conectado com sucesso! ${allTransactions.length} transações processadas.`,
      });
      
      // Atualizar lista de integrações ativas
      await fetchIntegrations();
      
    } catch (error) {
      console.error('Erro ao processar dados do Pluggy:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar dados da conexão.",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleManualSync = async (integration: Integration) => {
    if (!currentEmpresa?.id) return;

    setIsSyncing(true);

    try {
      // Buscar contas conectadas
      const accountsResponse = await fetch('/api/pluggy/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${integration.detalhes.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!accountsResponse.ok) {
        throw new Error('Erro ao buscar contas');
      }
      
      const accountsData = await accountsResponse.json();
      
      // Buscar transações para cada conta
      let allTransactions = [];
      
      for (const account of accountsData.results || []) {
        const transactionsResponse = await fetch(`/api/pluggy/accounts/${account.id}/transactions`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${integration.detalhes.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          allTransactions.push(...(transactionsData.results || []));
        }
      }
      
      // Processar e salvar dados
      await processPluggyData(accountsData.results || [], {
        total: allTransactions.length,
        totalPages: 1,
        page: 1,
        results: allTransactions
      });

      // Atualizar a data do último sincronismo
      const { error } = await supabase
        .from('integracoes_bancarias')
        .update({ ultimo_sincronismo: new Date().toISOString() })
        .eq('id', integration.id);

      if (error) {
        console.error('Erro ao atualizar data de sincronismo:', error);
      }

      toast({
        title: "Sincronizado!",
        description: "Dados bancários sincronizados com sucesso.",
      });
      
      await fetchIntegrations();
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao sincronizar dados bancários.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!currentEmpresa?.id) return;

    try {
      // Desativar a integração no banco de dados
      const { error } = await supabase
        .from('integracoes_bancarias')
        .update({ status: 'desativada' })
        .eq('id', integrationId);

      if (error) {
        console.error('Erro ao desativar integração:', error);
        throw new Error('Falha ao desativar integração.');
      }

      toast({
        title: "Desconectado",
        description: "Integração bancária desconectada com sucesso.",
      });

      // Recarregar integrações ativas
      await fetchIntegrations();
    } catch (error) {
      console.error('Erro ao desconectar integração:', error);
      toast({
        title: "Erro",
        description: "Falha ao desconectar integração.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, [currentEmpresa]);

  return (
    <AppLayout>
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Open Finance</h1>
        
        <div className="mb-6">
          <p className="text-muted-foreground">
            Conecte suas contas bancárias para importar automaticamente suas transações e ter uma visão completa da saúde financeira da sua empresa.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Conectar Nova Conta</h2>
          <PluggyButton onSuccess={handlePluggySuccess} isLoading={connecting} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Contas Conectadas</h2>
          {activeIntegrations.length === 0 ? (
            <div className="text-muted-foreground">Nenhuma conta conectada.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeIntegrations.map((integration) => (
                <div key={integration.id} className="bg-card rounded-lg shadow-sm p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{integration.nome_banco}</h3>
                      <Badge variant="outline" className="text-xs">
                        {integration.tipo_conexao}
                      </Badge>
                    </div>
                    <div>
                      {integration.status === 'ativa' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Última sincronização: {new Date(integration.ultimo_sincronismo).toLocaleDateString()}
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleManualSync(integration)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sincronizando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sincronizar
                        </>
                      )}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Desconectar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá desconectar sua conta bancária e remover o acesso aos seus dados financeiros.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDisconnect(integration.id)}>
                            Desconectar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default OpenFinancePage;
