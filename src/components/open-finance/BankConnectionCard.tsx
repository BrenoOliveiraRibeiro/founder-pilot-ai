
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, ChevronRight, LockIcon, AlertCircle, HelpCircle, Info } from "lucide-react";
import { ProvidersList } from "./ProvidersList";
import { ConnectionProgress } from "./ConnectionProgress";
import { SecurityInfoItems } from "./SecurityInfoItems";
import { PluggyLoadingStatus } from "./PluggyLoadingStatus";
import { useToast } from "@/components/ui/use-toast";

interface Provider {
  id: string;
  name: string;
  logo: string;
  popular: boolean;
}

interface BankConnectionCardProps {
  providers: Provider[];
  selectedProvider: string | null;
  setSelectedProvider: (provider: string) => void;
  connecting: boolean;
  connectionProgress: number;
  connectionStatus: string;
  pluggyWidgetLoaded: boolean;
  loadingScript: boolean;
  loadError: string | null;
  retryCount: number;
  loadingStatus: string;
  onForceReload: () => void;
  useSandbox: boolean;
  handleConnect: () => Promise<void>;
  connectContainerRef: React.RefObject<HTMLDivElement>;
}

export const BankConnectionCard = ({
  providers,
  selectedProvider,
  setSelectedProvider,
  connecting,
  connectionProgress,
  connectionStatus,
  pluggyWidgetLoaded,
  loadingScript,
  loadError,
  retryCount,
  loadingStatus,
  onForceReload,
  handleConnect,
  connectContainerRef
}: BankConnectionCardProps) => {
  const { toast } = useToast();
  
  const showHelpToast = () => {
    toast({
      title: "Ajuda sobre conexão bancária",
      description: "Use suas credenciais bancárias reais para conectar sua conta empresarial. Todos os dados são criptografados e protegidos.",
      variant: "default",
      duration: 10000,
    });
  };

  const selectedProviderName = providers.find(p => p.id === selectedProvider)?.name || 'Nenhum banco selecionado';

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Conectar Conta Empresarial</CardTitle>
            <CardDescription>
              Conecte suas contas bancárias PJ via Open Finance para análise automática
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              Produção
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Alert variant="default" className="mb-4 border-none bg-blue-50 text-blue-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo Produção Ativado</AlertTitle>
          <AlertDescription className="text-blue-800">
            Conecte suas contas bancárias empresariais reais usando suas credenciais do banco.
            <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
              <div>✓ Dados reais e atualizados</div>
              <div>✓ Conexão segura e criptografada</div>
              <div>✓ Integração com Open Finance Brasil</div>
            </div>
            <a 
              href="https://docs.pluggy.ai/docs/production-flow" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center text-blue-600 mt-1 text-sm hover:underline"
            >
              Ver documentação de produção <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </AlertDescription>
        </Alert>
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <LockIcon className="h-4 w-4" />
          <p>Utilizamos criptografia bancária e tecnologia Open Finance para manter seus dados seguros</p>
        </div>
        
        {/* Status do carregamento do Widget */}
        <div className="mb-6">
          <PluggyLoadingStatus 
            pluggyWidgetLoaded={pluggyWidgetLoaded}
            loadingScript={loadingScript}
            loadError={loadError}
            retryCount={retryCount}
            loadingStatus={loadingStatus}
            onForceReload={onForceReload}
          />
        </div>
        
        <ConnectionProgress 
          connectionProgress={connectionProgress}
          connectionStatus={connectionStatus}
          isVisible={connecting && connectionProgress > 0}
        />
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Selecione seu banco empresarial:</h3>
              <button
                onClick={showHelpToast}
                className="text-xs flex items-center text-muted-foreground hover:text-primary"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Ajuda
              </button>
            </div>
            <ProvidersList 
              providers={providers}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
            />
          </div>
          
          {/* Status de debug */}
          <div className="text-xs space-y-1 p-3 bg-gray-50 rounded border">
            <div className="font-medium text-gray-700">Status da Conexão:</div>
            <div>Banco selecionado: <span className="font-mono">{selectedProviderName}</span></div>
            <div>Widget carregado: <span className={pluggyWidgetLoaded ? 'text-green-600' : 'text-red-500'}>{pluggyWidgetLoaded ? 'Sim' : 'Não'}</span></div>
            <div>Container disponível: <span className={connectContainerRef.current ? 'text-green-600' : 'text-red-500'}>{connectContainerRef.current ? 'Sim' : 'Não'}</span></div>
            <div>Conectando: <span className={connecting ? 'text-blue-600' : 'text-gray-500'}>{connecting ? 'Sim' : 'Não'}</span></div>
            {loadingScript && <div>Carregando script: <span className="text-blue-600">Sim ({loadingStatus})</span></div>}
            {retryCount > 0 && <div>Tentativas: <span className="text-orange-600">{retryCount}/3</span></div>}
          </div>
          
          <SecurityInfoItems />
          
          {/* Container para o widget do Pluggy */}
          <div 
            id="pluggy-container" 
            ref={connectContainerRef} 
            className="pluggy-connect-container min-h-20 border-2 border-dashed border-gray-200 rounded-lg p-4"
          >
            <div className="text-center text-sm text-gray-500">
              {pluggyWidgetLoaded ? "Widget pronto - clique em 'Conectar com Widget' para abrir" : "Carregando widget..."}
            </div>
          </div>
          
          <div className="space-y-4">
            <Alert variant="default" className="bg-muted/40 border-dashed">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-sm font-medium">Como conectar sua conta empresarial</AlertTitle>
              <AlertDescription className="text-xs">
                1. Aguarde o widget carregar completamente
                2. Selecione seu banco acima (ex: C6 Bank)
                3. Clique em "Conectar com Widget" 
                4. Use suas credenciais bancárias reais da conta PJ
              </AlertDescription>
            </Alert>
            
            {/* Botão principal */}
            <Button 
              className="w-full group transition-all duration-200 relative overflow-hidden"
              disabled={!selectedProvider || connecting || !pluggyWidgetLoaded}
              onClick={handleConnect}
              size="lg"
            >
              <span className="relative z-10 flex items-center">
                {connecting ? "Conectando..." : "Conectar com Widget"}
                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </Button>
            
            {!pluggyWidgetLoaded && !loadingScript && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                ⚠️ Widget falhou ao carregar. Use o botão "Tentar Recarregar Widget" acima.
              </div>
            )}
            
            {!selectedProvider && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                ❌ Selecione um banco primeiro (ex: C6 Bank) para continuar.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
