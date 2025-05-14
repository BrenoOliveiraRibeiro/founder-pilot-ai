
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useWebhookIntegration = () => {
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  
  // Save webhook URL to database
  const saveWebhookUrl = async (url: string) => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada.",
        variant: "destructive"
      });
      return false;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('webhook_configs')
        .upsert({
          empresa_id: currentEmpresa.id,
          webhook_url: url,
          provider: 'n8n',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'empresa_id,provider'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "URL do webhook salva com sucesso."
      });
      
      return true;
    } catch (error: any) {
      console.error("Erro ao salvar URL do webhook:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a URL do webhook.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Test the webhook connection
  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Erro",
        description: "URL do webhook não configurada.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Send a test request to the webhook URL
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          empresa_id: currentEmpresa?.id,
          message: "Teste de conexão do SYNC Partners"
        }),
        mode: 'no-cors' // Important for cross-origin requests
      });
      
      toast({
        title: "Teste enviado",
        description: "Teste de conexão enviado para o webhook. Verifique o painel do n8n."
      });
    } catch (error: any) {
      console.error("Erro ao testar webhook:", error);
      toast({
        title: "Aviso",
        description: "O teste foi enviado, mas não foi possível verificar a resposta devido a restrições CORS.",
        variant: "warning"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    webhookUrl,
    setWebhookUrl,
    isSubmitting,
    saveWebhookUrl,
    testWebhook
  };
};
