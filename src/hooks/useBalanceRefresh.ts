
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const useBalanceRefresh = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const refreshBalances = async (): Promise<boolean> => {
    if (!currentEmpresa?.id) {
      console.warn('Nenhuma empresa selecionada para atualizar saldos');
      return false;
    }

    setRefreshing(true);
    console.log(`Iniciando atualização automática de saldos para empresa ${currentEmpresa.id}`);

    try {
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "refresh_balances",
          empresa_id: currentEmpresa.id
        }
      });

      if (error) {
        console.error("Erro na chamada da função:", error);
        throw new Error(error.message || 'Erro ao atualizar saldos');
      }

      if (data?.error) {
        console.error("Erro retornado pela edge function:", data.error);
        throw new Error(data.message || data.error);
      }

      console.log("Resultado da atualização de saldos:", data);

      if (data && data.success) {
        if (data.updatedIntegrations > 0) {
          toast({
            title: "Saldos atualizados!",
            description: `${data.updatedIntegrations} conta(s) atualizada(s) com sucesso.`,
          });
        }
        return true;
      } else {
        throw new Error(data?.message || 'Resposta inesperada do servidor');
      }

    } catch (error: any) {
      console.error("Erro ao atualizar saldos:", error);
      
      // Não mostrar toast de erro para falhas silenciosas na atualização automática
      // A interface ainda funcionará com dados em cache
      
      return false;
    } finally {
      setRefreshing(false);
    }
  };

  return {
    refreshBalances,
    refreshing
  };
};
