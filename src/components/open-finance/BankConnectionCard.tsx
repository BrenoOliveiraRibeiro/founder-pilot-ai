
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, ChevronRight, LockIcon, AlertCircle } from "lucide-react";
import { ProvidersList } from "./ProvidersList";
import { ConnectionProgress } from "./ConnectionProgress";
import { SecurityInfoItems } from "./SecurityInfoItems";
import { PluggyOAuthButton } from "./PluggyOAuthButton";

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
  useSandbox,
  handleConnect,
  connectContainerRef
}: BankConnectionCardProps) => {
  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Conectar Nova Conta</CardTitle>
            <CardDescription>
              Conecte suas contas bancárias via Open Finance para análise automática
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${useSandbox ? "text-primary" : "text-muted-foreground"}`}>Sandbox</span>
            <button 
              onClick={() => {/* This is handled in the parent component */}}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${useSandbox ? 'bg-primary' : 'bg-input'}`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-background transition-transform ${useSandbox ? 'translate-x-6' : 'translate-x-1'}`}></span>
            </button>
            <span className={`text-xs ${!useSandbox ? "text-primary" : "text-muted-foreground"}`}>Produção</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {useSandbox && (
          <Alert variant="info" className="mb-4 border-none bg-primary/5 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Modo Sandbox Ativado</AlertTitle>
            <AlertDescription className="text-primary/80">
              No modo sandbox, utilize as credenciais de teste disponibilizadas pelo Pluggy
              <a 
                href="https://docs.pluggy.ai/docs/sandbox-test-flow" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center text-primary mt-1 text-sm"
              >
                Ver documentação <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
          <LockIcon className="h-4 w-4" />
          <p>Utilizamos criptografia e tecnologia de ponta para manter seus dados seguros</p>
        </div>
        
        <ConnectionProgress 
          connectionProgress={connectionProgress}
          connectionStatus={connectionStatus}
          isVisible={connecting && connectionProgress > 0}
        />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-3">Selecione seu banco:</h3>
            <ProvidersList 
              providers={providers}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
            />
          </div>
          
          <SecurityInfoItems />
          
          {/* Container para o widget do Pluggy */}
          <div id="pluggy-container" ref={connectContainerRef} className="pluggy-connect-container min-h-20"></div>
          
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Widget-based connection */}
            <Button 
              className="w-full group transition-all duration-200 relative overflow-hidden"
              disabled={!selectedProvider || connecting || !pluggyWidgetLoaded}
              onClick={handleConnect}
            >
              <span className="relative z-10 flex items-center">
                {connecting ? "Conectando..." : "Conectar com Widget"}
                <ChevronRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
            </Button>
            
            {/* OAuth-based connection */}
            <PluggyOAuthButton 
              useSandbox={useSandbox}
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
