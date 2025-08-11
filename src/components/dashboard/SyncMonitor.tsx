import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface IntegracaoStatus {
  id: string;
  nome_banco: string;
  ultimo_sincronismo: string | null;
  status: string;
  minutosDesdeSync: number | null;
}

export const SyncMonitor = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  const [integracoes, setIntegracoes] = useState<IntegracaoStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);

  const fetchIntegracoes = async () => {
    if (!currentEmpresa?.id) return;

    try {
      const { data, error } = await supabase
        .from('integracoes_bancarias')
        .select('id, nome_banco, ultimo_sincronismo, status')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance');

      if (error) throw error;

      const agora = new Date();
      const integracoesComStatus = (data || []).map(integracao => {
        let minutosDesdeSync = null;
        
        if (integracao.ultimo_sincronismo) {
          const ultimaSync = new Date(integracao.ultimo_sincronismo);
          minutosDesdeSync = Math.floor((agora.getTime() - ultimaSync.getTime()) / (1000 * 60));
        }

        return {
          ...integracao,
          minutosDesdeSync
        };
      });

      setIntegracoes(integracoesComStatus);
    } catch (error) {
      console.error('Erro ao buscar integrações:', error);
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    if (!currentEmpresa?.id || syncInProgress) return;

    setSyncInProgress(true);
    
    try {
      console.log('Iniciando sincronização manual...');
      
      const { data: syncResult, error: syncError } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'sync_data',
          empresa_id: currentEmpresa.id,
          sandbox: true
        }
      });

      if (syncError) {
        throw new Error(syncError.message || 'Erro na sincronização');
      }

      console.log('Sincronização manual concluída:', syncResult);
      
      toast({
        title: "Sincronização concluída",
        description: `${syncResult?.newTransactions || 0} novas transações foram processadas.`,
      });

      // Atualizar lista de integrações
      await fetchIntegracoes();
      
    } catch (error: any) {
      console.error('Erro na sincronização manual:', error);
      
      toast({
        title: "Erro na sincronização",
        description: error.message || "Não foi possível sincronizar os dados.",
        variant: "destructive",
      });
    } finally {
      setSyncInProgress(false);
    }
  };

  const getStatusColor = (minutosDesdeSync: number | null, status: string) => {
    if (status !== 'ativo') return 'destructive';
    if (minutosDesdeSync === null) return 'secondary';
    if (minutosDesdeSync > 60) return 'destructive';
    if (minutosDesdeSync > 30) return 'default';
    return 'default';
  };

  const getStatusIcon = (minutosDesdeSync: number | null, status: string) => {
    if (status !== 'ativo') return <AlertCircle className="w-4 h-4" />;
    if (minutosDesdeSync === null) return <Clock className="w-4 h-4" />;
    if (minutosDesdeSync > 60) return <AlertCircle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const formatarTempo = (minutos: number | null) => {
    if (minutos === null) return 'Nunca';
    if (minutos < 60) return `${minutos}min atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  };

  useEffect(() => {
    fetchIntegracoes();
    
    // Atualizar a cada 1 minuto
    const interval = setInterval(fetchIntegracoes, 60000);
    
    return () => clearInterval(interval);
  }, [currentEmpresa?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monitor de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (integracoes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Monitor de Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Nenhuma integração bancária encontrada
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Monitor de Sincronização</CardTitle>
        <Button
          size="sm"
          variant="outline"
          onClick={forceSync}
          disabled={syncInProgress}
          className="h-8"
        >
          {syncInProgress ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span className="ml-1">Sincronizar</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {integracoes.map(integracao => (
          <div key={integracao.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div className="flex items-center gap-2">
              {getStatusIcon(integracao.minutosDesdeSync, integracao.status)}
              <span className="text-sm font-medium">{integracao.nome_banco}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatarTempo(integracao.minutosDesdeSync)}
              </span>
              <Badge 
                variant={getStatusColor(integracao.minutosDesdeSync, integracao.status)}
                className="text-xs"
              >
                {integracao.status}
              </Badge>
            </div>
          </div>
        ))}
        
        {integracoes.some(i => i.minutosDesdeSync && i.minutosDesdeSync > 30) && (
          <div className="pt-2 text-xs text-amber-600 dark:text-amber-400">
            ⚠️ Algumas integrações precisam de sincronização
          </div>
        )}
      </CardContent>
    </Card>
  );
};