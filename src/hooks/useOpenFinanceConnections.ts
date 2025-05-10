
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fromIntegracoesBancarias } from '@/integrations/supabase/typedClient';
import { IntegracaoBancaria } from '@/integrations/supabase/models';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook para gerenciar as conexões de Open Finance
 * Responsável por buscar, sincronizar e formatar dados de integrações bancárias
 */
export const useOpenFinanceConnections = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<IntegracaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();

  // Verifica se há uma empresa selecionada para buscar integrações
  const validateCompanySelection = () => {
    if (!currentEmpresa?.id) {
      console.log("Nenhuma empresa selecionada para buscar integrações");
      setActiveIntegrations([]);
      return false;
    }
    return true;
  };

  // Registra erro e exibe notificação
  const handleError = (error: any, step: string, userMessage: string) => {
    console.error(`Erro em ${step}:`, error);
    toast({
      title: "Erro",
      description: userMessage,
      variant: "destructive"
    });
    return false;
  };

  // Busca as integrações bancárias da empresa atual
  const fetchIntegrations = async () => {
    if (!validateCompanySelection()) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Buscando integrações para empresa ${currentEmpresa?.id}`);
      
      const { data, error } = await fromIntegracoesBancarias()
        .select("*")
        .eq("empresa_id", currentEmpresa?.id)
        .eq("tipo_conexao", "Open Finance");

      if (error) {
        throw error;
      }
      
      console.log(`Encontradas ${data?.length || 0} integrações bancárias`);
      setActiveIntegrations(data as IntegracaoBancaria[]);
    } catch (error) {
      handleError(
        error, 
        "fetch_integrations", 
        "Não foi possível carregar suas integrações bancárias. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Sincroniza os dados financeiros de uma integração específica
  const handleSyncData = async (integracaoId: string) => {
    if (!validateCompanySelection()) {
      return;
    }

    setSyncing(integracaoId);
    try {
      console.log(`Iniciando sincronização de dados para integração ${integracaoId}`);
      
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "sync",
          empresa_id: currentEmpresa.id,
          integration_id: integracaoId
        }
      });

      if (error) {
        throw error;
      }

      console.log("Dados sincronizados com sucesso:", data);
      
      toast({
        title: "Dados sincronizados!",
        description: "Os dados financeiros da sua empresa foram atualizados.",
      });

      // Atualizar a lista de integrações e dados da empresa
      await fetchIntegrations();
      await refreshEmpresas();
    } catch (error: any) {
      handleError(
        error, 
        "sync_data", 
        error.message || "Não foi possível sincronizar os dados financeiros. Tente novamente."
      );
    } finally {
      setSyncing(null);
    }
  };

  // Formata uma data para exibição
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

  // Buscar integrações quando a empresa atual mudar
  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchIntegrations();
    } else {
      setActiveIntegrations([]);
    }
  }, [currentEmpresa]);

  return {
    activeIntegrations,
    loading,
    syncing,
    handleSyncData,
    formatDate,
    fetchIntegrations
  };
};
