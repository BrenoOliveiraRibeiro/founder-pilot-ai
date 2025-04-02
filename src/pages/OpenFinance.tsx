import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { IntegracaoBancaria } from "@/integrations/supabase/models";
import { Building, Check, ChevronRight, Database, Lock, RefreshCw, Shield } from "lucide-react";

const PROVIDERS = [
  { id: "itau", name: "Itaú", logo: "I", popular: true },
  { id: "bradesco", name: "Bradesco", logo: "B", popular: true },
  { id: "santander", name: "Santander", logo: "S", popular: true },
  { id: "nubank", name: "Nubank", logo: "N", popular: true },
  { id: "caixa", name: "Caixa", logo: "C", popular: false },
  { id: "banco-do-brasil", name: "Banco do Brasil", logo: "BB", popular: false },
];

const OpenFinance = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeIntegrations, setActiveIntegrations] = useState<IntegracaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user, currentEmpresa } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchIntegrations();
    }
  }, [currentEmpresa]);

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("integracoes_bancarias")
        .select("*")
        .eq("empresa_id", currentEmpresa?.id)
        .eq("tipo_conexao", "Open Finance");

      if (error) throw error;
      setActiveIntegrations(data as IntegracaoBancaria[]);
    } catch (error) {
      console.error("Erro ao buscar integrações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedProvider || !currentEmpresa?.id) return;

    setConnecting(true);
    try {
      // Chamar a função Edge para obter URL de autorização
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          provedor: selectedProvider
        }
      });

      if (error) throw error;

      // Normalmente redirecionaria para URL de autorização
      // Mas para fins de demonstração, vamos simular um callback bem-sucedido
      await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          empresa_id: currentEmpresa.id,
          provedor: selectedProvider,
          authorization_code: "demo-auth-code-" + Date.now()
        }
      });

      toast({
        title: "Conta conectada com sucesso!",
        description: `Sua conta ${getProviderName(selectedProvider)} foi conectada via Open Finance.`,
      });

      // Atualizar a lista de integrações
      fetchIntegrations();
    } catch (error) {
      console.error("Erro ao conectar conta:", error);
      toast({
        title: "Erro ao conectar conta",
        description: "Não foi possível estabelecer conexão com o banco. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleSyncData = async (integracaoId: string) => {
    if (!currentEmpresa?.id) return;

    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "sync",
          empresa_id: currentEmpresa.id
        }
      });

      if (error) throw error;

      toast({
        title: "Dados sincronizados!",
        description: "Os dados financeiros da sua empresa foram atualizados.",
      });

      // Atualizar a lista de integrações para mostrar o último sincronismo
      fetchIntegrations();
    } catch (error) {
      console.error("Erro ao sincronizar dados:", error);
      toast({
        title: "Erro ao sincronizar dados",
        description: "Não foi possível sincronizar os dados financeiros. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSyncing(false);
    }
  };

  const getProviderName = (providerId: string) => {
    return PROVIDERS.find((p) => p.id === providerId)?.name || providerId;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca sincronizado";
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Conectar Open Finance</h1>
        
        {activeIntegrations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Integrações Ativas</CardTitle>
              <CardDescription>
                Gerencie suas conexões de Open Finance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeIntegrations.map((integration) => (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                      {integration.nome_banco.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">{integration.nome_banco}</h3>
                      <p className="text-xs text-muted-foreground">
                        Última sincronização: {formatDate(integration.ultimo_sincronismo)}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSyncData(integration.id)}
                    disabled={syncing}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {syncing ? "Sincronizando..." : "Sincronizar Dados"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Conectar Nova Conta</CardTitle>
            <CardDescription>
              Conecte suas contas bancárias via Open Finance para análise automática
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
              <Lock className="h-4 w-4" />
              <p>Utilizamos criptografia e tecnologia de ponta para manter seus dados seguros</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Selecione seu banco:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PROVIDERS.map((provider) => (
                    <div
                      key={provider.id}
                      className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                        selectedProvider === provider.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-primary/30"
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {provider.logo}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{provider.name}</div>
                        {provider.popular && (
                          <div className="text-xs text-muted-foreground">Popular</div>
                        )}
                      </div>
                      {selectedProvider === provider.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-sm">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Conexão segura via Open Finance</p>
                    <p className="text-muted-foreground">Você será redirecionado para o site do seu banco para autorizar o compartilhamento de dados.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Database className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Acesso somente leitura</p>
                    <p className="text-muted-foreground">Teremos acesso apenas à leitura de seus dados, sem permissão para realizar transações.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Dados empresariais</p>
                    <p className="text-muted-foreground">Será necessário selecionar sua conta PJ durante o processo de autorização.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                disabled={!selectedProvider || connecting}
                onClick={handleConnect}
              >
                {connecting ? "Conectando..." : "Conectar Conta Bancária"}
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default OpenFinance;
