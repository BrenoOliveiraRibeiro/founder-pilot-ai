import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useTransactionsRefresh = () => {
  const { currentEmpresa } = useAuth();
  const queryClient = useQueryClient();
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncTransactions = async () => {
    if (!currentEmpresa?.id || isSyncing) return;

    // Evitar sincronizações muito frequentes (mínimo 5 minutos)
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    if (now - lastSyncTime < fiveMinutes) {
      console.log('Sincronização ignorada - muito cedo');
      return;
    }

    setIsSyncing(true);

    try {
      console.log('Iniciando sincronização de transações...');

      // Chamar edge function para sincronizar dados do Open Finance
      const { data, error } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'sync',
          empresa_id: currentEmpresa.id,
          sandbox: false
        }
      });

      if (error) {
        console.error('Erro na sincronização:', error);
        return;
      }

      console.log('Resultado da sincronização:', data);

      // Invalidar cache após sincronização bem-sucedida
      queryClient.invalidateQueries({ 
        queryKey: ['recent-transactions', currentEmpresa.id] 
      });

      // Mostrar toast se encontrou novas transações
      if (data?.newTransactions > 0) {
        toast({
          title: "Novas Transações",
          description: `${data.newTransactions} novas transações foram encontradas`,
        });
      }

      setLastSyncTime(now);
      console.log(`Sincronização concluída: ${data?.message}`);
    } catch (error) {
      console.error('Erro ao sincronizar transações:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshTransactions = async () => {
    if (!currentEmpresa?.id) return;

    try {
      // Executar sincronização real das APIs
      await syncTransactions();
    } catch (error) {
      console.error('Erro ao atualizar transações:', error);
    }
  };

  useEffect(() => {
    if (!currentEmpresa?.id) return;

    // Executar primeira sincronização imediatamente
    syncTransactions();

    // Configurar intervalo de 10 minutos para atualizações automáticas
    const interval = setInterval(syncTransactions, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentEmpresa?.id]);

  return { refreshTransactions, isSyncing };
};