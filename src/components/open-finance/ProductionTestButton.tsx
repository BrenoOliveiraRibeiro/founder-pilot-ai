
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export const ProductionTestButton = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testProductionConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      console.log("Testando conexão de produção com Pluggy...");
      
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "test_connection",
          sandbox: false // Sempre produção
        }
      });

      console.log("Resultado do teste:", { data, error });

      if (error) {
        throw new Error(error.message || "Erro na conexão");
      }

      if (!data.success) {
        throw new Error(data.message || "Falha no teste de conexão");
      }

      setTestResult(data);
      toast({
        title: "✅ Conexão de produção estabelecida!",
        description: `${data.connectorsCount || 0} conectores PJ disponíveis na produção.`,
        variant: "default"
      });

    } catch (error: any) {
      console.error("Erro no teste de conexão:", error);
      setTestResult({ success: false, error: error.message });
      toast({
        title: "❌ Falha no teste de produção",
        description: error.message || "Verifique as credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={testProductionConnection}
        disabled={isTestingConnection}
        className="w-full"
        variant="outline"
      >
        {isTestingConnection ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testando Produção...
          </>
        ) : (
          <>
            {testResult?.success ? (
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            ) : testResult?.success === false ? (
              <XCircle className="mr-2 h-4 w-4 text-red-500" />
            ) : null}
            Testar Conexão Produção
          </>
        )}
      </Button>

      {testResult && (
        <div className={`p-3 rounded-lg text-sm ${
          testResult.success 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {testResult.success ? (
            <div>
              <div className="font-medium">✅ Conexão bem-sucedida!</div>
              <div className="mt-1">
                Conectores disponíveis: {testResult.connectorsCount || 0}
              </div>
              <div className="text-xs mt-2 text-green-600">
                Pronto para conectar contas bancárias reais PJ
              </div>
            </div>
          ) : (
            <div>
              <div className="font-medium">❌ Falha na conexão</div>
              <div className="mt-1">{testResult.error}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
