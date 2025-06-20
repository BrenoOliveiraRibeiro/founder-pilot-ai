import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IntegracaoBancaria } from '@/integrations/supabase/models';
import { useToast } from '@/components/ui/use-toast';

export const useOpenFinanceConnections = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<IntegracaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    if (!currentEmpresa?.id) {
      setActiveIntegrations([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("integracoes_bancarias")
        .select("*")
        .eq("empresa_id", currentEmpresa?.id)
        .eq("tipo_conexao", "Open Finance");

      if (error) {
        console.error("Erro ao buscar integrações:", error);
        throw new Error(`Falha ao carregar integrações: ${error.message}`);
      }
      
      setActiveIntegrations(data as IntegracaoBancaria[]);
    } catch (error: any) {
      console.error("Erro ao buscar integrações:", error);
      toast({
        title: "Erro ao carregar integrações",
        description: error.message || "Não foi possível carregar suas integrações bancárias. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async (integracaoId: string) => {
    if (!currentEmpresa?.id) return;

    setSyncing(integracaoId);
    console.log(`🚀 [FRONTEND] Iniciando sincronização da integração ${integracaoId} para empresa ${currentEmpresa.id}`);
    
    // Toast inicial informando que a sincronização começou
    toast({
      title: "Sincronização iniciada",
      description: "Atualizando dados bancários e sincronizando transações...",
    });

    // Preparar payload para debug
    const payload = {
      action: "sync",
      empresa_id: currentEmpresa.id,
      integration_id: integracaoId
    };
    
    console.log(`📦 [FRONTEND] Payload sendo enviado:`, JSON.stringify(payload, null, 2));
    
    try {
      console.log(`📡 [FRONTEND] Chamando supabase.functions.invoke("open-finance")...`);
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: payload
      });

      console.log(`📥 [FRONTEND] Resposta recebida - data:`, data);
      console.log(`📥 [FRONTEND] Resposta recebida - error:`, error);

      if (error) {
        console.error("❌ [FRONTEND] Erro na chamada da função:", error);
        
        // Extrair mensagem de erro mais detalhada
        let errorMessage = 'Erro desconhecido na sincronização';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.context && error.context.error) {
          errorMessage = error.context.error;
        }
        
        throw new Error(errorMessage);
      }

      // Verificar se a resposta contém erro
      if (data?.error) {
        console.error("❌ [FRONTEND] Erro retornado pela edge function:", data.error);
        throw new Error(data.message || data.error);
      }

      console.log("✅ [FRONTEND] Resultado da sincronização:", data);

      // Determinar mensagem e tipo de toast baseado no resultado
      let title = "Sincronização concluída";
      let description = "Os dados foram processados com sucesso.";
      let variant: "default" | "destructive" = "default";
      
      if (data && typeof data.newTransactions !== 'undefined') {
        if (data.newTransactions > 0) {
          title = "Dados sincronizados!";
          description = `${data.newTransactions} novas transações foram salvas automaticamente.`;
          if (data.duplicates > 0) {
            description += ` (${data.duplicates} duplicatas ignoradas)`;
          }
        } else if (data.duplicates > 0) {
          title = "Nenhuma transação nova";
          description = "Todas as transações já estão salvas no sistema.";
        } else {
          title = "Sincronização concluída";
          description = "Nenhuma transação encontrada para sincronizar.";
        }
        
        // Adicionar informação sobre atualização de contas se disponível
        if (data.accountDataUpdated) {
          description += " Saldos das contas foram atualizados.";
        }
      } else if (data && data.message) {
        description = data.message;
      }

      toast({
        title: title,
        description: description,
        variant: variant
      });

      // Update the list of integrations to show the latest sync
      fetchIntegrations();
      refreshEmpresas();
    } catch (error: any) {
      console.error("💥 [FRONTEND] Erro ao sincronizar dados:", error);
      
      let errorMessage = "Não foi possível sincronizar os dados financeiros.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: "Erro na sincronização",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSyncing(null);
    }
  };

  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchIntegrations();
    } else {
      setActiveIntegrations([]);
    }
  }, [currentEmpresa]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca sincronizado";
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate,
    fetchIntegrations
  };
};
