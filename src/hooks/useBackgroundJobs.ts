
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export type JobType = 'sync_transactions' | 'calculate_metrics' | 'generate_insights' | 'update_runway';
export type JobPriority = 'low' | 'medium' | 'high';

interface JobRequest {
  jobType: JobType;
  priority?: JobPriority;
  payload?: any;
}

interface JobResult {
  success: boolean;
  jobType: JobType;
  result?: any;
  error?: string;
  timestamp: string;
}

export const useBackgroundJobs = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const executeJob = useCallback(async (jobRequest: JobRequest): Promise<JobResult> => {
    if (!currentEmpresa?.id) {
      throw new Error('Empresa não encontrada');
    }

    try {
      console.log(`Executando job em background: ${jobRequest.jobType}`);
      
      const { data, error } = await supabase.functions.invoke('background-jobs', {
        body: {
          ...jobRequest,
          empresaId: currentEmpresa.id,
          priority: jobRequest.priority || 'medium'
        }
      });

      if (error) {
        console.error('Erro no background job:', error);
        throw new Error(error.message || 'Erro ao executar job');
      }

      console.log('Background job concluído:', data);
      return data;

    } catch (error: any) {
      console.error('Erro inesperado no background job:', error);
      throw error;
    }
  }, [currentEmpresa?.id]);

  const syncTransactions = useCallback(async (sandbox: boolean = true) => {
    try {
      const result = await executeJob({
        jobType: 'sync_transactions',
        priority: 'high',
        payload: { sandbox }
      });

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
  }, [executeJob, toast]);

  const calculateMetrics = useCallback(async () => {
    try {
      const result = await executeJob({
        jobType: 'calculate_metrics',
        priority: 'medium'
      });

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
  }, [executeJob, toast]);

  const generateInsights = useCallback(async () => {
    try {
      const result = await executeJob({
        jobType: 'generate_insights',
        priority: 'low'
      });

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
  }, [executeJob, toast]);

  const updateRunway = useCallback(async () => {
    try {
      const result = await executeJob({
        jobType: 'update_runway',
        priority: 'medium'
      });

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
  }, [executeJob, toast]);

  const runFullUpdate = useCallback(async () => {
    try {
      toast({
        title: "Processamento iniciado",
        description: "Executando atualização completa em background...",
      });

      // Execute jobs in sequence with proper error handling
      const results = await Promise.allSettled([
        syncTransactions(),
        calculateMetrics(),
        generateInsights(),
        updateRunway()
      ]);

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
  }, [syncTransactions, calculateMetrics, generateInsights, updateRunway, toast]);

  return {
    executeJob,
    syncTransactions,
    calculateMetrics,
    generateInsights,
    updateRunway,
    runFullUpdate
  };
};
