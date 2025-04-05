
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, TestTube } from "lucide-react";
import { formatBelvoError } from "@/lib/utils";

interface ConnectionTestResultsProps {
  error: string | null;
  testResult: any;
}

export const ConnectionTestResults: React.FC<ConnectionTestResultsProps> = ({ 
  error, 
  testResult 
}) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-3">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Erro na conexão com Belvo</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs h-7"
            >
              <a href="/open-finance" className="flex items-center">
                Configurar Open Finance <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (testResult && testResult.success) {
    return (
      <div className="p-3 rounded-md bg-primary/5 border border-primary/20 mb-3 text-sm">
        <div className="font-medium flex items-center">
          <TestTube className="h-4 w-4 mr-2 text-primary" />
          Conexão Belvo ativa
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          {testResult.accountsCount} contas de teste disponíveis para integração
        </div>
        <Button 
          variant="link" 
          size="sm" 
          asChild
          className="p-0 h-auto text-xs"
        >
          <a href="/open-finance" className="flex items-center mt-1">
            Configurar integrações <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
      </div>
    );
  }
  
  return null;
};
