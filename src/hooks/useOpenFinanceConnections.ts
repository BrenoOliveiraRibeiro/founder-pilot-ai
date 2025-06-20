
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IntegracaoBancaria } from '@/integrations/supabase/models';
import { useToast } from '@/components/ui/use-toast';

export const useOpenFinanceConnections = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<IntegracaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState(false);
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

  const updatePluggyItems = async () => {
    if (!currentEmpresa?.id || activeIntegrations.length === 0) {
      return;
    }

    setUpdatingItems(true);
    console.log('Iniciando atualização automática dos items Pluggy...');
    
    try {
      // Para cada integração ativa, fazer PATCH no item da Pluggy
      for (const integration of activeIntegrations) {
        if (!integration.item_id) {
          console.warn(`Integração ${integration.nome_banco} não possui item_id`);
          continue;
        }

        console.log(`Atualizando item Pluggy para ${integration.nome_banco} (${integration.item_id})`);

        // Chamar edge function para fazer PATCH no item e processar novas transações
        const { data, error } = await supabase.functions.invoke("open-finance", {
          body: {
            action: "update_item",
            empresa_id: currentEmpresa.id,
            item_id: integration.item_id,
            integration_id: integration.id
          }
        });

        if (error) {
          console.error(`Erro ao atualizar item ${integration.item_id}:`, error);
          continue;
        }

        if (data?.error) {
          console.error(`Erro retornado pela edge function para ${integration.item_id}:`, data.error);
          continue;
        }

        console.log(`Item ${integration.item_id} atualizado:`, data);

        // Se houver novas transações, mostrar toast
        if (data?.newTransactions > 0) {
          toast({
            title: `${integration.nome_banco} atualizado`,
            description: `${data.newTransactions} novas transações foram encontradas e salvas.`,
          });
        }
      }

      // Atualizar a lista de integrações para mostrar o último sincronismo
      await fetchIntegrations();
      refreshEmpresas();
      
    } catch (error: any) {
      console.error("Erro ao atualizar items Pluggy:", error);
      toast({
        title: "Erro na atualização automática",
        description: "Houve um problema ao verificar atualizações nas contas bancárias.",
        variant: "destructive"
      });
    } finally {
      setUpdatingItems(false);
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

      if (data?.error) {
        console.error("Erro retornado pela edge function:", data.error);
        throw new Error(data.message || data.error);
      }

      console.log("Resultado da sincronização:", data);

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

      fetchIntegrations();
      refreshEmpresas();
    } catch (error: any) {
      console.error("Erro ao sincronizar dados:", error);
      
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

  // Effect para carregar integrações e fazer update automático na primeira carga
  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchIntegrations().then(() => {
        // Após carregar integrações, fazer update automático dos items
        updatePluggyItems();
      });
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
    updatingItems,
    handleSyncData,
    formatDate,
    fetchIntegrations,
    updatePluggyItems
  };
};
