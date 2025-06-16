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

      if (error) throw error;
      setActiveIntegrations(data as IntegracaoBancaria[]);
    } catch (error) {
      console.error("Erro ao buscar integrações:", error);
      toast({
        title: "Erro ao carregar integrações",
        description: "Não foi possível carregar suas integrações bancárias. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncData = async (integracaoId: string) => {
    if (!currentEmpresa?.id) return;

    setSyncing(integracaoId);
    console.log(`Iniciando sincronização da integração ${integracaoId} para empresa ${currentEmpresa.id}`);
    
    try {
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "sync",
          empresa_id: currentEmpresa.id,
          integration_id: integracaoId
        }
      });

      if (error) {
        console.error("Erro na chamada da função:", error);
        throw error;
      }

      console.log("Resultado da sincronização:", data);

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
      console.error("Erro ao sincronizar dados:", error);
      
      let errorMessage = "Não foi possível sincronizar os dados financeiros. Tente novamente.";
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao sincronizar dados",
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
