
import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { IntegracaoBancaria } from "@/integrations/supabase/models";
import { AlertTriangle, Building, Check, ChevronRight, Database, Lock, RefreshCw, Shield } from "lucide-react";

const PROVIDERS = [
  { id: "itau", name: "Itaú", logo: "I", popular: true },
  { id: "bradesco", name: "Bradesco", logo: "B", popular: true },
  { id: "santander", name: "Santander", logo: "S", popular: true },
  { id: "nubank", name: "Nubank", logo: "N", popular: true },
  { id: "caixa", name: "Caixa", logo: "C", popular: false },
  { id: "banco-do-brasil", name: "Banco do Brasil", logo: "BB", popular: false },
];

declare global {
  interface Window {
    belvoSDK?: any;
  }
}

const OpenFinance = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeIntegrations, setActiveIntegrations] = useState<IntegracaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [belvoWidgetLoaded, setBelvoWidgetLoaded] = useState(false);
  const { user, currentEmpresa } = useAuth();
  const { toast } = useToast();
  const belvoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar o script do Belvo Widget
    if (!document.getElementById("belvo-script")) {
      const script = document.createElement("script");
      script.id = "belvo-script";
      script.src = "https://cdn.belvo.io/belvo-widget-1-stable.js";
      script.async = true;
      script.onload = () => setBelvoWidgetLoaded(true);
      document.head.appendChild(script);
    } else {
      setBelvoWidgetLoaded(true);
    }

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
    if (!selectedProvider || !currentEmpresa?.id || !belvoWidgetLoaded) {
      toast({
        title: "Erro",
        description: "Selecione um banco e tente novamente.",
        variant: "destructive"
      });
      return;
    }

    setConnecting(true);
    try {
      // Obter token para o widget do Belvo
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          institution: selectedProvider
        }
      });

      if (error) throw error;
      if (!data.widget_token) throw new Error("Token não retornado");

      // Inicializar e abrir o widget do Belvo
      if (window.belvoSDK) {
        const successCallback = (link: string, institution: string) => {
          console.log("Link criado com sucesso:", link);
          handleBelvoSuccess(link, institution);
        };

        const errorCallback = (error: any) => {
          console.error("Erro no widget do Belvo:", error);
          toast({
            title: "Erro de conexão",
            description: "Não foi possível conectar ao banco. Tente novamente.",
            variant: "destructive"
          });
          setConnecting(false);
        };

        const exitCallback = () => {
          console.log("Widget fechado pelo usuário");
          setConnecting(false);
        };

        const widget = window.belvoSDK.createWidget(data.widget_token, {
          callback: (link_id: string, institution: string) => 
            successCallback(link_id, institution),
          onError: errorCallback,
          onExit: exitCallback,
          locale: "pt",
          institution: data.institution
        }).build();

        widget.mount(belvoContainerRef.current);
        
      } else {
        throw new Error("Widget do Belvo não carregado");
      }
    } catch (error: any) {
      console.error("Erro ao conectar conta:", error);
      toast({
        title: "Erro ao conectar conta",
        description: error.message || "Não foi possível estabelecer conexão com o banco. Tente novamente.",
        variant: "destructive"
      });
      setConnecting(false);
    }
  };

  const handleBelvoSuccess = async (linkId: string, institution: string) => {
    if (!currentEmpresa?.id) return;
    
    try {
      // Registrar o link no backend
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          empresa_id: currentEmpresa.id,
          link_id: linkId,
          institution: institution
        }
      });

      if (error) throw error;

      toast({
        title: "Conta conectada com sucesso!",
        description: `Sua conta foi conectada via Open Finance e os dados estão sendo sincronizados.`,
      });

      // Atualizar a lista de integrações
      fetchIntegrations();
    } catch (error: any) {
      console.error("Erro ao registrar conexão:", error);
      toast({
        title: "Erro ao registrar conexão",
        description: error.message || "A conexão foi estabelecida, mas houve um erro ao registrar. Tente novamente.",
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
    } catch (error: any) {
      console.error("Erro ao sincronizar dados:", error);
      toast({
        title: "Erro ao sincronizar dados",
        description: error.message || "Não foi possível sincronizar os dados financeiros. Tente novamente.",
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

  const isRunwayCritical = (integration: IntegracaoBancaria) => {
    // Esta função verifica se o runway da integração está crítico (< 3 meses)
    return integration.detalhes?.runway_meses < 3;
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
                      {isRunwayCritical(integration) && (
                        <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Runway crítico: ação necessária</span>
                        </div>
                      )}
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
              
              {/* Container para o widget do Belvo */}
              <div ref={belvoContainerRef} className="belvo-widget-container"></div>
              
              <Button 
                className="w-full" 
                disabled={!selectedProvider || connecting || !belvoWidgetLoaded}
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
