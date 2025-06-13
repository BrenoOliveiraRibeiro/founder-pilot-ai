
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Bug, Info } from 'lucide-react';

interface OpenFinanceStatusSectionProps {
  currentEmpresa: any;
  authLoading: boolean;
  handleTestConnection: () => Promise<void>;
  debugInfo: any;
}

export const OpenFinanceStatusSection = ({
  currentEmpresa,
  authLoading,
  handleTestConnection,
  debugInfo
}: OpenFinanceStatusSectionProps) => {
  return (
    <>
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
    </>
  );
};
