
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { IntegracaoBancaria } from '@/integrations/supabase/models';
import { useToast } from '@/components/ui/use-toast';
import { usePluggyTransactions } from './usePluggyTransactions';
import { pluggyApi } from '@/utils/pluggyApi';

export const useOpenFinanceConnections = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<IntegracaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [autoSyncing, setAutoSyncing] = useState(false);
  const { currentEmpresa, refreshEmpresas } = useAuth();
  const { toast } = useToast();
  const { processAndSaveTransactions } = usePluggyTransactions();

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

  // Função para sincronizar transações automaticamente via API da Pluggy
  const autoSyncTransactions = async () => {
    if (!currentEmpresa?.id || autoSyncing) return;

    const activeIntegrationsList = activeIntegrations.filter(int => 
      int.status === 'ativo' && int.item_id
    );

    if (activeIntegrationsList.length === 0) {
      console.log('Nenhuma integração ativa encontrada para sincronização automática');
      return;
    }

    setAutoSyncing(true);
    console.log(`Iniciando sincronização automática de ${activeIntegrationsList.length} integrações`);

    let totalNewTransactions = 0;
    let totalProcessedIntegrations = 0;

    try {
      for (const integracao of activeIntegrationsList) {
        try {
          console.log(`Sincronizando automaticamente: ${integracao.nome_banco} (${integracao.id})`);
          
          // Buscar dados da conta via API
          const accountData = await pluggyApi.fetchAccountData(integracao.item_id!);
          
          if (accountData?.results && accountData.results.length > 0) {
            // Para cada conta, buscar e processar transações
            for (const account of accountData.results) {
              try {
                // Buscar transações mais recentes (últimas 2 páginas para pegar dados novos)
                const page1 = await pluggyApi.fetchTransactions(account.id, 1, 50);
                const page2 = await pluggyApi.fetchTransactions(account.id, 2, 50);
                
                let allTransactions = [];
                if (page1?.results) allTransactions = [...allTransactions, ...page1.results];
                if (page2?.results) allTransactions = [...allTransactions, ...page2.results];
                
                if (allTransactions.length > 0) {
                  const result = await processAndSaveTransactions(
                    integracao.item_id!,
                    account.id,
                    {
                      results: allTransactions,
                      total: allTransactions.length
                    }
                  );
                  
                  if (result.success) {
                    totalNewTransactions += result.newTransactions || 0;
                    console.log(`Conta ${account.name}: ${result.newTransactions} novas transações processadas`);
                  }
                }
              } catch (accountError) {
                console.error(`Erro ao processar conta ${account.id}:`, accountError);
              }
            }
            
            totalProcessedIntegrations++;
            
            // Atualizar timestamp de sincronização
            await supabase
              .from("integracoes_bancarias")
              .update({ ultimo_sincronismo: new Date().toISOString() })
              .eq("id", integracao.id);
              
          }
        } catch (integracaoError) {
          console.error(`Erro ao sincronizar integração ${integracao.id}:`, integracaoError);
        }
      }

      console.log(`Sincronização automática concluída: ${totalNewTransactions} novas transações de ${totalProcessedIntegrations} integrações`);

      // Mostrar toast apenas se houver transações novas
      if (totalNewTransactions > 0) {
        toast({
          title: "Transações atualizadas automaticamente",
          description: `${totalNewTransactions} novas transações foram sincronizadas de ${totalProcessedIntegrations} conta${totalProcessedIntegrations !== 1 ? 's' : ''}.`,
        });

        // Atualizar a lista de integrações para mostrar novo timestamp
        fetchIntegrations();
        refreshEmpresas();
      } else {
        console.log('Nenhuma transação nova encontrada na sincronização automática');
      }

    } catch (error: any) {
      console.error("Erro na sincronização automática:", error);
      toast({
        title: "Erro na sincronização automática",
        description: "Algumas transações podem não ter sido atualizadas. Você pode sincronizar manualmente.",
        variant: "destructive",
      });
    } finally {
      setAutoSyncing(false);
    }
  };

  const handleSyncData = async (integracaoId: string) => {
    if (!currentEmpresa?.id) return;

    setSyncing(integracaoId);
    console.log(`Iniciando sincronização manual da integração ${integracaoId} para empresa ${currentEmpresa.id}`);
    
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

  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchIntegrations();
    } else {
      setActiveIntegrations([]);
    }
  }, [currentEmpresa]);

  // Sincronizar automaticamente após carregar as integrações
  useEffect(() => {
    if (activeIntegrations.length > 0 && !loading && !autoSyncing) {
      console.log('Iniciando sincronização automática de transações...');
      autoSyncTransactions();
    }
  }, [activeIntegrations, loading]);

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
    autoSyncing,
    handleSyncData,
    formatDate,
    fetchIntegrations,
    autoSyncTransactions
  };
};
