
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeService, type RealtimeUpdateOptions } from '@/services/realtimeService';

export const useRealtimeUpdates = (options: RealtimeUpdateOptions = {}) => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const showUpdateNotification = useCallback((type: string) => {
    toast({
      title: "Dados atualizados",
      description: `Novos ${type} foram sincronizados automaticamente.`,
      duration: 3000,
    });
  }, [toast]);

  useEffect(() => {
    if (!currentEmpresa?.id) return;

    const realtimeService = new RealtimeService();
    realtimeService.subscribe(currentEmpresa.id, options, showUpdateNotification);

    return () => {
      realtimeService.unsubscribe();
    };
  }, [currentEmpresa?.id, options, showUpdateNotification]);
};
