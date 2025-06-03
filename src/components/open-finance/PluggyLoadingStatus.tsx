
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';

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
        <span>Widget Pluggy carregado e pronto para uso!</span>
      </div>
    );
  }

  if (loadingScript) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-blue-800">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando Widget Pluggy
          </CardTitle>
          <CardDescription className="text-blue-600">
            {loadingStatus}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-blue-600">
            {retryCount > 0 && (
              <div>Tentativa: {retryCount + 1}/4</div>
            )}
            <div className="mt-1">Aguarde alguns segundos...</div>
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
                  <li>Tentar em uma aba anônima</li>
                  <li>Recarregar a página</li>
                </ul>
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
