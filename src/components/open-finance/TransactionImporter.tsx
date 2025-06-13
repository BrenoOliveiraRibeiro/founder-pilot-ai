
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const TransactionImporter = () => {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const handleImport = async () => {
    if (!currentEmpresa?.id) {
      setError('Nenhuma empresa selecionada');
      return;
    }

    setImporting(true);
    setError(null);
    setImportResult(null);

    try {
      console.log('Iniciando importação de transações...');
      
      const { data, error: functionError } = await supabase.functions.invoke('import-pluggy-transactions', {
        body: {
          empresa_id: currentEmpresa.id
        }
      });

      if (functionError) {
        throw functionError;
      }

      console.log('Resultado da importação:', data);
      setImportResult(data);
      
      toast({
        title: "Importação concluída!",
        description: `${data.novas_inseridas} transações importadas com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro na importação:', error);
      setError(error.message || 'Erro desconhecido na importação');
      
      toast({
        title: "Erro na importação",
        description: error.message || "Não foi possível importar as transações.",
        variant: "destructive"
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Importar Transações da Pluggy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Importe automaticamente suas transações bancárias da API da Pluggy para o FounderPilot.
        </p>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {importResult && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p><strong>Importação concluída:</strong></p>
                <p>• Total processadas: {importResult.total_processadas}</p>
                <p>• Novas inseridas: {importResult.novas_inseridas}</p>
                <p>• Duplicatas ignoradas: {importResult.duplicatas_ignoradas}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleImport}
          disabled={importing || !currentEmpresa?.id}
          className="w-full"
        >
          {importing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Importar Transações
            </>
          )}
        </Button>

        {!currentEmpresa?.id && (
          <p className="text-sm text-muted-foreground text-center">
            Selecione uma empresa para importar transações
          </p>
        )}
      </CardContent>
    </Card>
  );
};
