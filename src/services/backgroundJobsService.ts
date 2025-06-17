
import { supabase } from '@/integrations/supabase/client';

export type JobType = 'sync_transactions' | 'calculate_metrics' | 'generate_insights' | 'update_runway';
export type JobPriority = 'low' | 'medium' | 'high';

interface JobRequest {
  jobType: JobType;
  priority?: JobPriority;
  payload?: any;
}

export interface JobResult {
  success: boolean;
  jobType: JobType;
  result?: any;
  error?: string;
  timestamp: string;
}

export class BackgroundJobsService {
  static async executeJob(jobRequest: JobRequest, empresaId: string): Promise<JobResult> {
    if (!empresaId) {
      throw new Error('Empresa não encontrada');
    }

    try {
      console.log(`Executando job em background: ${jobRequest.jobType}`);
      
      const { data, error } = await supabase.functions.invoke('background-jobs', {
        body: {
          ...jobRequest,
          empresaId,
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
  }

  static async syncTransactions(empresaId: string, sandbox: boolean = true): Promise<JobResult> {
    return this.executeJob({
      jobType: 'sync_transactions',
      priority: 'high',
      payload: { sandbox }
    }, empresaId);
  }

  static async calculateMetrics(empresaId: string): Promise<JobResult> {
    return this.executeJob({
      jobType: 'calculate_metrics',
      priority: 'medium'
    }, empresaId);
  }

  static async generateInsights(empresaId: string): Promise<JobResult> {
    return this.executeJob({
      jobType: 'generate_insights',
      priority: 'low'
    }, empresaId);
  }

  static async updateRunway(empresaId: string): Promise<JobResult> {
    return this.executeJob({
      jobType: 'update_runway',
      priority: 'medium'
    }, empresaId);
  }

  static async runFullUpdate(empresaId: string): Promise<PromiseSettledResult<JobResult>[]> {
    const results = await Promise.allSettled([
      this.syncTransactions(empresaId),
      this.calculateMetrics(empresaId),
      this.generateInsights(empresaId),
      this.updateRunway(empresaId)
    ]);

    return results;
  }
}
