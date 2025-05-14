
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { useWebhookIntegration } from "@/hooks/useWebhookIntegration";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertCircle, ArrowRight, Globe, Server } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const N8NIntegration = () => {
  const {
    webhookUrl,
    setWebhookUrl,
    isSubmitting,
    saveWebhookUrl,
    testWebhook
  } = useWebhookIntegration();
  
  const { currentEmpresa } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveWebhookUrl(webhookUrl);
  };
  
  const handleTest = async () => {
    await testWebhook();
  };
  
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">N8N Integração</h1>
            <p className="text-muted-foreground mt-1">
              Configure a integração com n8n para automação de fluxos de dados
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Os dados são sincronizados automaticamente
            </p>
          </div>
        </div>
        
        {!currentEmpresa && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Você precisa ter uma empresa cadastrada para usar a integração com n8n. 
              Por favor, complete o cadastro da sua empresa.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Webhook</CardTitle>
                <CardDescription>
                  Configure a URL do webhook do n8n para integração com o SYNC Partners
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="webhookUrl" className="text-sm font-medium">
                      URL do Webhook n8n
                    </label>
                    <Input 
                      id="webhookUrl"
                      placeholder="https://n8n.example.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole a URL do webhook gerada no seu fluxo do n8n
                    </p>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTest}
                  disabled={!webhookUrl || isSubmitting}
                >
                  Testar Conexão
                </Button>
                <Button 
                  type="submit" 
                  onClick={handleSubmit}
                  disabled={!webhookUrl || isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar Configuração"}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Como configurar</CardTitle>
                <CardDescription>
                  Passos para configurar a integração com n8n
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div>
                      <p>Acesse seu painel do n8n e crie um novo fluxo de trabalho</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div>
                      <p>Adicione um nó de "Webhook" como trigger do fluxo</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <p>Copie a URL do webhook e cole no campo acima</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <span className="text-xs font-bold">4</span>
                    </div>
                    <div>
                      <p>Teste a conexão para verificar se está funcionando</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 rounded-full p-1 mt-0.5">
                      <span className="text-xs font-bold">5</span>
                    </div>
                    <div>
                      <p>Configure os nós de processamento no n8n conforme necessário</p>
                    </div>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Endpoint para Uso no N8N
              </CardTitle>
              <CardDescription>
                Use este endpoint para enviar dados do n8n para o SYNC Partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md overflow-x-auto">
                <code className="text-sm">
                  https://fhimpyxzedzildagctpq.supabase.co/functions/v1/n8n-webhook
                </code>
              </div>
              <p className="text-sm mt-2">
                Método HTTP: <span className="font-medium">POST</span>
              </p>
              <p className="text-sm mt-1">
                Parâmetros obrigatórios:
              </p>
              <ul className="list-disc list-inside text-sm ml-4 mt-1">
                <li>
                  <code className="bg-muted px-1 rounded">empresa_id</code>: ID da empresa (UUID)
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default N8NIntegration;
