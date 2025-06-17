
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBackgroundJobs } from '@/hooks/useBackgroundJobs';
import { RefreshCw, Database, Calculator, Lightbulb, TrendingUp, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface JobConfig {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  action: () => Promise<any>;
  color: string;
}

export const BackgroundJobsManager: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResults, setLastResults] = useState<Record<string, any>>({});
  
  const {
    syncTransactions,
    calculateMetrics,
    generateInsights,
    updateRunway,
    runFullUpdate
  } = useBackgroundJobs();

  const handleJobExecution = async (jobFunction: () => Promise<any>, jobName: string) => {
    setIsRunning(true);
    try {
      const result = await jobFunction();
      setLastResults(prev => ({ ...prev, [jobName]: result }));
    } catch (error) {
      console.error(`Error executing ${jobName}:`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFullUpdate = async () => {
    setIsRunning(true);
    try {
      const results = await runFullUpdate();
      setLastResults(prev => ({ ...prev, fullUpdate: results }));
    } catch (error) {
      console.error('Error executing full update:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const jobs: JobConfig[] = [
    {
      id: 'sync',
      name: 'Sincronizar Transações',
      icon: Database,
      description: 'Buscar novas transações das contas conectadas',
      action: () => handleJobExecution(syncTransactions, 'sync'),
      color: 'bg-blue-500'
    },
    {
      id: 'metrics',
      name: 'Calcular Métricas',
      icon: Calculator,
      description: 'Recalcular métricas financeiras e KPIs',
      action: () => handleJobExecution(calculateMetrics, 'metrics'),
      color: 'bg-green-500'
    },
    {
      id: 'insights',
      name: 'Gerar Insights',
      icon: Lightbulb,
      description: 'Analisar dados e gerar recomendações',
      action: () => handleJobExecution(generateInsights, 'insights'),
      color: 'bg-yellow-500'
    },
    {
      id: 'runway',
      name: 'Atualizar Projeções',
      icon: TrendingUp,
      description: 'Recalcular projeções de runway e fluxo de caixa',
      action: () => handleJobExecution(updateRunway, 'runway'),
      color: 'bg-purple-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Processamento em Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const Icon = job.icon;
            const hasResult = lastResults[job.id];
            
            return (
              <motion.div
                key={job.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="border border-muted">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${job.color} text-white`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{job.name}</h4>
                          {hasResult && (
                            <Badge variant="secondary" className="text-xs">
                              {hasResult.success ? 'Sucesso' : 'Erro'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          {job.description}
                        </p>
                        <Button
                          onClick={job.action}
                          disabled={isRunning}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          {isRunning ? (
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3 mr-1" />
                          )}
                          Executar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <Button
            onClick={handleFullUpdate}
            disabled={isRunning}
            className="w-full"
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar Atualização Completa
              </>
            )}
          </Button>
          
          {lastResults.fullUpdate && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Última atualização completa executada com sucesso
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
