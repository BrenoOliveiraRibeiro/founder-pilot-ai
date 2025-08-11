import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para sincronização automática das integrações bancárias
 * Executa sincronização automática a cada 5 minutos quando há integrações ativas
 */
export const useAutoSync = () => {
  const { currentEmpresa } = useAuth();

  const performAutoSync = useCallback(async () => {
    if (!currentEmpresa?.id) return;

    try {
      console.log('Executando sincronização automática...');
      
      // Verificar se há integrações ativas
      const { data: integracoes, error: integracoesError } = await supabase
        .from('integracoes_bancarias')
        .select('id, nome_banco, ultimo_sincronismo, detalhes')
        .eq('empresa_id', currentEmpresa.id)
        .eq('status', 'ativo')
        .eq('tipo_conexao', 'Open Finance');

      if (integracoesError || !integracoes || integracoes.length === 0) {
        console.log('Nenhuma integração ativa encontrada para sincronização automática');
        return;
      }

      // Verificar se alguma integração precisa de sincronização
      const agora = new Date();
      const integracoesPendentes = integracoes.filter(integracao => {
        if (!integracao.ultimo_sincronismo) return true;
        
        const ultimaSync = new Date(integracao.ultimo_sincronismo);
        const diferencaMinutos = (agora.getTime() - ultimaSync.getTime()) / (1000 * 60);
        
        // Sincronizar se passou mais de 30 minutos da última sincronização
        return diferencaMinutos > 30;
      });

      if (integracoesPendentes.length === 0) {
        console.log('Todas as integrações estão atualizadas');
        return;
      }

      console.log(`Sincronizando ${integracoesPendentes.length} integrações pendentes...`);

      // Executar sincronização para todas as integrações pendentes
      for (const integracao of integracoesPendentes) {
        try {
          console.log(`Sincronizando: ${integracao.nome_banco}`);
          
          const { data: syncResult, error: syncError } = await supabase.functions.invoke('open-finance', {
            body: {
              action: 'sync',
              empresa_id: currentEmpresa.id,
              integration_id: integracao.id,
              sandbox: (integracao.detalhes as any)?.sandbox || true
            }
          });

          if (syncError) {
            console.error(`Erro na sincronização automática de ${integracao.nome_banco}:`, syncError);
          } else {
            console.log(`Sincronização de ${integracao.nome_banco} concluída:`, syncResult);
          }
        } catch (error) {
          console.error(`Erro ao sincronizar ${integracao.nome_banco}:`, error);
        }
      }

      console.log('Sincronização automática concluída');
    } catch (error) {
      console.error('Erro na sincronização automática:', error);
    }
  }, [currentEmpresa?.id]);

  // Executar sincronização a cada 5 minutos
  useEffect(() => {
    if (!currentEmpresa?.id) return;

    // Execução inicial após 10 segundos
    const initialTimeout = setTimeout(performAutoSync, 10000);

    // Execução periódica a cada 5 minutos
    const interval = setInterval(performAutoSync, 5 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [currentEmpresa?.id, performAutoSync]);

  return {
    performAutoSync
  };
};