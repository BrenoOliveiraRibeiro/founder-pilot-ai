import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { ConnectionProgress } from './ConnectionProgress';
import { useBankUpdateWidget } from '@/hooks/useBankUpdateWidget';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BankUpdateCard = () => {
  const {
    isUpdating,
    updateProgress,
    updateStatus,
    connections,
    selectedConnection,
    setSelectedConnection,
    updateContainerRef,
    isScriptLoaded,
    handleUpdateConnection,
    fetchConnections
  } = useBankUpdateWidget();

  useEffect(() => {
    fetchConnections();
  }, []);

  const selectedConnectionData = connections.find(c => c.id === selectedConnection);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Pendente';
    }
  };

  const formatLastSync = (lastSync: string | null) => {
    if (!lastSync) return 'Nunca sincronizado';
    
    try {
      return `Última sincronização: ${format(new Date(lastSync), 'dd/MM/yyyy HH:mm', { 
        locale: ptBR 
      })}`;
    } catch {
      return 'Data inválida';
    }
  };

  if (connections.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Atualizar Conexões Bancárias</CardTitle>
          <CardDescription>
            Nenhuma conexão bancária encontrada. Conecte uma conta primeiro.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Atualizar Conexões Bancárias
        </CardTitle>
        <CardDescription>
          Revalide suas conexões existentes via Open Finance
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Connection Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Selecione a conexão para atualizar:</label>
            <Select value={selectedConnection || ""} onValueChange={setSelectedConnection}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma conexão bancária" />
              </SelectTrigger>
              <SelectContent>
                {connections.map((connection) => (
                  <SelectItem key={connection.id} value={connection.id}>
                    <div className="flex items-center gap-2 w-full">
                      {getStatusIcon(connection.status)}
                      <span className="font-medium">{connection.institution_name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {getStatusText(connection.status)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Connection Details */}
          {selectedConnectionData && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{selectedConnectionData.institution_name}</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedConnectionData.status)}
                  <span className="text-sm">{getStatusText(selectedConnectionData.status)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatLastSync(selectedConnectionData.last_sync)}
              </p>
              <p className="text-xs text-muted-foreground">
                Item ID: {selectedConnectionData.item_id}
              </p>
            </div>
          )}

          {/* Progress */}
          <ConnectionProgress 
            connectionProgress={updateProgress}
            connectionStatus={updateStatus}
            isVisible={isUpdating && updateProgress > 0}
          />

          {/* Widget Container */}
          <div id="pluggy-update-container" ref={updateContainerRef} className="pluggy-connect-container min-h-20"></div>

          {/* Update Button */}
          <Button 
            className="w-full group transition-all duration-200"
            disabled={!selectedConnection || isUpdating || !isScriptLoaded}
            onClick={handleUpdateConnection}
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : 'group-hover:rotate-90'} transition-transform`} />
              {isUpdating ? "Atualizando..." : "Atualizar Conexão"}
            </span>
          </Button>

          {/* Help Text */}
          <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="font-medium mb-1">💡 Quando atualizar sua conexão:</p>
            <ul className="space-y-1 ml-4">
              <li>• Quando houver erros de sincronização</li>
              <li>• Após mudanças na senha do banco</li>
              <li>• Para revalidar autenticação de dois fatores</li>
              <li>• Quando solicitado pelo sistema</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};