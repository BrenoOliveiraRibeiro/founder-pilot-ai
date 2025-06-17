
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { BackgroundJobsService, type JobResult } from '@/services/backgroundJobsService';

export const useBackgroundJobs = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const syncTransactions = useCallback(async (sandbox: boolean = true) => {
    if (!currentEmpresa?.id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      const result = await BackgroundJobsService.syncTransactions(currentEmpresa.id, sandbox);

      if (result.success) {
        toast({
          title: "Transações sincronizadas",
          description: `${result.result?.newTransactions || 0} novas transações processadas em background.`,
        });
      }

      return result;
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar as transações.",
        variant: "destructive"
      });
      throw error;
    }
  }, [currentEmpresa?.id, toast]);

  const calculateMetrics = useCallback(async () => {
    if (!currentEmpresa?.id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      const result = await BackgroundJobsService.calculateMetrics(currentEmpresa.id);

      if (result.success) {
        toast({
          title: "Métricas atualizadas",
          description: "As métricas financeiras foram recalculadas com sucesso.",
        });
      }

      return result;
    } catch (error: any) {
      toast({
        title: "Erro no cálculo",
        description: error.message || "Não foi possível calcular as métricas.",
        variant: "destructive"
      });
      throw error;
    }
  }, [currentEmpresa?.id, toast]);

  const generateInsights = useCallback(async () => {
    if (!currentEmpresa?.id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      const result = await BackgroundJobsService.generateInsights(currentEmpresa.id);

      if (result.success && result.result?.generatedInsights > 0) {
        toast({
          title: "Insights gerados",
          description: `${result.result.generatedInsights} novos insights foram criados.`,
        });
      }

      return result;
    } catch (error: any) {
      toast({
        title: "Erro na geração de insights",
        description: error.message || "Não foi possível gerar insights.",
        variant: "destructive"
      });
      throw error;
    }
  }, [currentEmpresa?.id, toast]);

  const updateRunway = useCallback(async () => {
    if (!currentEmpresa?.id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      const result = await BackgroundJobsService.updateRunway(currentEmpresa.id);

      if (result.success) {
        toast({
          title: "Projeções atualizadas",
          description: "As projeções de runway foram recalculadas.",
        });
      }

      return result;
    } catch (error: any) {
      toast({
        title: "Erro na projeção",
        description: error.message || "Não foi possível atualizar as projeções.",
        variant: "destructive"
      });
      throw error;
    }
  }, [currentEmpresa?.id, toast]);

  const runFullUpdate = useCallback(async () => {
    if (!currentEmpresa?.id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      toast({
        title: "Processamento iniciado",
        description: "Executando atualização completa em background...",
      });

      const results = await BackgroundJobsService.runFullUpdate(currentEmpresa.id);

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: "Atualização concluída",
          description: `${successful} de ${results.length} processos concluídos com sucesso.`,
        });
      }

      if (failed > 0) {
        toast({
          title: "Alguns processos falharam",
          description: `${failed} processos não puderam ser concluídos.`,
          variant: "destructive"
        });
      }

      return results;
    } catch (error: any) {
      toast({
        title: "Erro na atualização completa",
        description: error.message || "Não foi possível executar a atualização completa.",
        variant: "destructive"
      });
      throw error;
    }
  }, [currentEmpresa?.id, toast]);

  return {
    syncTransactions,
    calculateMetrics,
    generateInsights,
    updateRunway,
    runFullUpdate
  };
};
