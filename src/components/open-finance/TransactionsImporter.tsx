
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ImportLog {
  totalProcessed: number;
  totalInserted: number;
  totalIgnored: number;
  errors: string[];
  csvBackupPath?: string;
}

export const TransactionsImporter = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importLog, setImportLog] = useState<ImportLog | null>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const handleImportTransactions = async () => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Empresa não selecionada",
        variant: "destructive"
      });
      return;
    }

    // Para demonstração, vamos usar um item_id fixo
    // Em uma implementação real, isso viria da integração ativa
    const itemId = "item_sample_id"; // Substitua pelo item_id real da integração

    setIsImporting(true);
    setImportLog(null);

    try {
      console.log("Iniciando importação de transações...");
      
      const { data, error } = await supabase.functions.invoke("pluggy-transactions-import", {
        body: {
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          sandbox: true
        }
      });

      if (error) {
        throw error;
      }

      console.log("Importação concluída:", data);
      setImportLog(data.log);

      toast({
        title: "Importação concluída!",
        description: `${data.log.totalInserted} transações importadas com sucesso.`,
      });

    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast({
        title: "Erro na importação",
        description: error.message || "Não foi possível importar as transações",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Importação de Transações
        </CardTitle>
        <CardDescription>
          Importe transações da Pluggy diretamente para o Supabase com backup em CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleImportTransactions}
            disabled={isImporting || !currentEmpresa?.id}
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando transações...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Importar Transações
              </>
            )}
          </Button>

          {importLog && (
            <div className="p-4 rounded-lg bg-muted space-y-2">
              <h4 className="font-medium">Relatório da Importação</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Processadas:</span>
                  <br />
                  {importLog.totalProcessed}
                </div>
                <div>
                  <span className="font-medium">Inseridas:</span>
                  <br />
                  <span className="text-green-600">{importLog.totalInserted}</span>
                </div>
                <div>
                  <span className="font-medium">Ignoradas:</span>
                  <br />
                  <span className="text-yellow-600">{importLog.totalIgnored}</span>
                </div>
              </div>
              
              {importLog.csvBackupPath && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Backup CSV:</span> {importLog.csvBackupPath}
                </div>
              )}

              {importLog.errors.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium text-red-600">Erros:</span>
                  <ul className="list-disc list-inside text-red-600">
                    {importLog.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Como funciona:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Autentica na API da Pluggy usando suas credenciais</li>
            <li>Busca todas as transações com paginação automática</li>
            <li>Gera backup em CSV antes da importação</li>
            <li>Verifica duplicatas baseado no ID da transação</li>
            <li>Importa dados para a tabela 'transacoes' do Supabase</li>
            <li>Gera relatório detalhado da operação</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
