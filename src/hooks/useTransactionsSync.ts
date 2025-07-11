import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to manage real-time synchronization of transactions
 * across the application
 */
export const useTransactionsSync = () => {
  const { currentEmpresa } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!currentEmpresa?.id) return;

    console.log('Setting up global transactions sync...');
    
    const channel = supabase
      .channel('global-transactions-sync')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'transacoes',
          filter: `empresa_id=eq.${currentEmpresa.id}`
        },
        (payload) => {
          console.log('Global transaction change detected:', payload);
          
          // Invalidate all transaction-related queries
          queryClient.invalidateQueries({ 
            queryKey: ['recent-transactions', currentEmpresa.id] 
          });
          
          // Also invalidate any other finance-related queries that might be affected
          queryClient.invalidateQueries({ 
            queryKey: ['finance-metrics', currentEmpresa.id] 
          });
          
          queryClient.invalidateQueries({ 
            queryKey: ['dashboard-metrics', currentEmpresa.id] 
          });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up global transactions sync');
      supabase.removeChannel(channel);
    };
  }, [currentEmpresa?.id, queryClient]);

  return {
    // This hook doesn't return anything, it just sets up global sync
  };
};