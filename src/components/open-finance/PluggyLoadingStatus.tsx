
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface PluggyLoadingStatusProps {
  pluggyWidgetLoaded: boolean;
  loadingScript: boolean;
  loadError: string | null;
  retryCount: number;
  loadingStatus: string;
  onForceReload: () => void;
}

export const PluggyLoadingStatus: React.FC<PluggyLoadingStatusProps> = ({
  pluggyWidgetLoaded,
  loadingScript,
  loadError,
  retryCount,
  loadingStatus,
  onForceReload
}) => {
  if (pluggyWidgetLoaded) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
        <CheckCircle className="h-4 w-4" />
        <span>Widget Pluggy carregado e pronto para uso! (Versão oficial v3)</span>
      </div>
    );
  }

  if (loadingScript) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando Widget Pluggy Oficial
          </CardTitle>
          <CardDescription className="text-blue-600">
            {loadingStatus}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-blue-600">
            {retryCount > 0 && (
              <div>Tentativa: {retryCount + 1}/3</div>
            )}
            <div className="mt-1">Carregando da CDN oficial do Pluggy...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            Erro no Carregamento do Widget
          </CardTitle>
          <CardDescription className="text-red-600">
            {loadError}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="text-xs text-red-600">
              <div>Status: {loadingStatus}</div>
              <div className="mt-2">
                <strong>Possíveis soluções:</strong>
                <ul className="list-disc list-inside mt-1">
                  <li>Verificar conexão com internet</li>
                  <li>Desabilitar bloqueador de anúncios</li>
                  <li>Verificar se o domínio cdn.pluggy.ai está acessível</li>
                  <li>Tentar em uma aba anônima</li>
                  <li>Recarregar a página</li>
                </ul>
              </div>
              <div className="mt-2">
                <a 
                  href="https://pluggy.journey.io/p/4ae200b795bc473091a3168e296ebc4d" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 text-xs hover:underline"
                >
                  Ver documentação oficial <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
            <Button
              onClick={onForceReload}
              variant="outline"
              size="sm"
              className="w-full text-red-700 border-red-300 hover:bg-red-100"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Tentar Recarregar Widget
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};
