
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Download, AlertCircle, CheckCircle, RefreshCw, Bug } from 'lucide-react';

interface ImportLog {
  total_processed: number;
  total_inserted: number;
  total_ignored: number;
  errors: string[];
  started_at: string;
  completed_at: string;
}

interface TransactionImporterProps {
  itemId?: string;
}

export const TransactionImporter: React.FC<TransactionImporterProps> = ({ itemId }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importLog, setImportLog] = useState<ImportLog | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada",
        variant: "destructive"
      });
      return;
    }

    if (!itemId) {
      toast({
        title: "Erro", 
        description: "Item ID da Pluggy não encontrado. Conecte sua conta primeiro.",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setProgress(10);
    setImportLog(null);
    setErrorDetails(null);

    try {
      console.log('Iniciando importação de transações...');
      console.log('Dados da requisição:', {
        empresa_id: currentEmpresa.id,
        item_id: itemId
      });
      
      setProgress(25);

      // Chamar a Edge Function para importar transações
      const { data, error } = await supabase.functions.invoke('pluggy-transactions-import', {
        body: {
          empresa_id: currentEmpresa.id,
          item_id: itemId
        }
      });

      console.log('Resposta da Edge Function:', { data, error });
      setProgress(100);

      if (error) {
        console.error('Erro da Edge Function:', error);
        setErrorDetails(error);
        throw new Error(`Erro da Edge Function: ${error.message || JSON.stringify(error)}`);
      }

      if (!data) {
        throw new Error('Nenhum dado retornado da Edge Function');
      }

      if (!data.success) {
        console.error('Falha na importação:', data);
        setErrorDetails(data);
        throw new Error(data.error || 'Falha na importação');
      }

      setImportLog(data.log);
      
      toast({
        title: "Importação concluída!",
        description: `${data.log.total_inserted} transações importadas com sucesso.`,
      });

      console.log('Importação concluída:', data.log);

    } catch (error: any) {
      console.error('Erro na importação:', error);
      setErrorDetails(error);
      
      let errorMessage = "Falha ao importar transações da Pluggy";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Importar Transações da Pluggy
        </CardTitle>
        <CardDescription>
          Importa todas as transações da sua conta conectada na Pluggy para o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Botão de importação */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleImport}
            disabled={isImporting || !itemId}
            className="w-full"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Iniciar Importação
              </>
            )}
          </Button>

          {!itemId && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você precisa conectar sua conta na Pluggy primeiro para importar transações.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Barra de progresso */}
        {isImporting && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso da importação</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {/* Detalhes do erro */}
        {errorDetails && (
          <Alert variant="destructive">
            <Bug className="h-4 w-4" />
            <AlertDescription>
              <details>
                <summary className="cursor-pointer font-medium">
                  Detalhes do erro (clique para expandir)
                </summary>
                <div className="mt-2 space-y-2">
                  <div className="text-xs bg-destructive/5 p-2 rounded overflow-auto max-h-40">
                    <pre>{JSON.stringify(errorDetails, null, 2)}</pre>
                  </div>
                  {currentEmpresa?.id && (
                    <div className="text-xs">
                      <strong>Empresa ID:</strong> {currentEmpresa.id}
                    </div>
                  )}
                  {itemId && (
                    <div className="text-xs">
                      <strong>Item ID:</strong> {itemId}
                    </div>
                  )}
                </div>
              </details>
            </AlertDescription>
          </Alert>
        )}

        {/* Log da importação */}
        {importLog && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Importação Concluída</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-medium text-blue-600">{importLog.total_processed}</div>
                <div className="text-gray-600">Processadas</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-medium text-green-600">{importLog.total_inserted}</div>
                <div className="text-gray-600">Inseridas</div>
              </div>
              <div className="text-center p-2 bg-yellow-50 rounded">
                <div className="font-medium text-yellow-600">{importLog.total_ignored}</div>
                <div className="text-gray-600">Ignoradas</div>
              </div>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>Iniciado em: {formatDate(importLog.started_at)}</div>
              <div>Concluído em: {formatDate(importLog.completed_at)}</div>
            </div>

            {importLog.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <details>
                    <summary className="cursor-pointer font-medium">
                      {importLog.errors.length} erro(s) encontrado(s)
                    </summary>
                    <div className="mt-2 space-y-1">
                      {importLog.errors.map((error, index) => (
                        <div key={index} className="text-xs">{error}</div>
                      ))}
                    </div>
                  </details>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          <p>• As transações serão importadas para a tabela de transações da sua empresa</p>
          <p>• Transações já existentes serão ignoradas automaticamente</p>
          <p>• O processo pode levar alguns minutos dependendo do volume de dados</p>
        </div>
      </CardContent>
    </Card>
  );
};
