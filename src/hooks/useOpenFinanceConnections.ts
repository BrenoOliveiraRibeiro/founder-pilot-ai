
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
    try {
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "sync",
          empresa_id: currentEmpresa.id,
          integration_id: integracaoId
        }
      });

      if (error) throw error;

      // Determinar mensagem baseada no resultado
      let message = "Dados sincronizados!";
      let description = "Os dados financeiros da sua empresa foram atualizados.";
      
      if (data && data.newTransactions !== undefined) {
        if (data.newTransactions > 0) {
          description = `${data.newTransactions} novas transações foram salvas automaticamente.`;
          if (data.duplicates > 0) {
            description += ` (${data.duplicates} duplicatas ignoradas)`;
          }
        } else {
          message = "Sincronização concluída";
          description = "Nenhuma transação nova encontrada. Todos os dados estão atualizados.";
        }
      }

      toast({
        title: message,
        description: description,
      });

      // Update the list of integrations to show the latest sync
      fetchIntegrations();
      refreshEmpresas();
    } catch (error: any) {
      console.error("Erro ao sincronizar dados:", error);
      toast({
        title: "Erro ao sincronizar dados",
        description: error.message || "Não foi possível sincronizar os dados financeiros. Tente novamente.",
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
