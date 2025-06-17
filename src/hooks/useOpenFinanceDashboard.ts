
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { OpenFinanceService, type OpenFinanceMetrics } from '@/services/openFinanceService';

export const useOpenFinanceDashboard = () => {
  const [metrics, setMetrics] = useState<OpenFinanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const fetchOpenFinanceData = async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const metricsData = await OpenFinanceService.getMetrics(currentEmpresa.id);
      setMetrics(metricsData);

    } catch (error: any) {
      console.error('Erro ao buscar dados do Open Finance:', error);
      setError(error.message || 'Erro ao carregar dados financeiros');
      
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do Open Finance. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Configurar atualizações em tempo real
  useRealtimeUpdates({
    onTransactionUpdate: fetchOpenFinanceData,
    onMetricsUpdate: fetchOpenFinanceData,
    onIntegrationUpdate: fetchOpenFinanceData
  });

  useEffect(() => {
    fetchOpenFinanceData();
  }, [currentEmpresa?.id]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchOpenFinanceData
  };
};
