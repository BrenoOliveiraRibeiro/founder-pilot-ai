
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface PluggyConnectionData {
  itemId: string;
  accountData: any;
  transactionsData: any;
  isConnected: boolean;
  connectionToken?: string;
}

export const usePluggyDatabase = () => {
  const [connectionData, setConnectionData] = useState<PluggyConnectionData | null>(null);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const loadExistingConnection = useCallback(async () => {
    if (!currentEmpresa?.id) {
      return null;
    }

    try {
      console.log('Carregando conexão Pluggy existente para empresa:', currentEmpresa.id);
      
      const { data: integracoes, error } = await supabase
        .from('integracoes_bancarias')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .eq('tipo_conexao', 'Open Finance')
        .eq('status', 'ativo')
        .not('item_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Erro ao carregar integração bancária:', error);
        throw new Error(`Falha ao carregar integração: ${error.message}`);
      }

      if (integracoes && integracoes.length > 0) {
        const integracao = integracoes[0];
        console.log('Conexão existente encontrada:', integracao.nome_banco);
        
        const connectionData = {
          itemId: integracao.item_id!,
          accountData: integracao.account_data,
          transactionsData: null,
          isConnected: true,
          connectionToken: integracao.connection_token || undefined
        };

        setConnectionData(connectionData);
        return connectionData;
      }

      console.log('Nenhuma conexão Pluggy existente encontrada');
      return null;
    } catch (error: any) {
      console.error('Erro ao carregar conexão existente:', error);
      toast({
        title: "Erro ao carregar conexão",
        description: error.message || "Não foi possível restaurar a conexão anterior. Você pode conectar novamente.",
        variant: "destructive",
      });
      return null;
    }
  }, [currentEmpresa?.id, toast]);

  const saveConnection = useCallback(async (
    itemId: string, 
    accountData: any, 
    connectionToken?: string,
    bankName?: string
  ) => {
    if (!currentEmpresa?.id) return;

    try {
      console.log('Salvando nova conexão Pluggy:', { itemId, bankName });
      
      const { data: existing } = await supabase
        .from('integracoes_bancarias')
        .select('id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('integracoes_bancarias')
          .update({
            account_data: accountData,
            connection_token: connectionToken,
            ultimo_sincronismo: new Date().toISOString(),
            status: 'ativo'
          })
          .eq('id', existing.id);

        if (error) {
          throw new Error(`Erro ao atualizar conexão: ${error.message}`);
        }
      } else {
        const { error } = await supabase
          .from('integracoes_bancarias')
          .insert({
            empresa_id: currentEmpresa.id,
            item_id: itemId,
            nome_banco: bankName || 'Banco Conectado via Pluggy',
            tipo_conexao: 'Open Finance',
            status: 'ativo',
            account_data: accountData,
            connection_token: connectionToken,
            ultimo_sincronismo: new Date().toISOString(),
            detalhes: {
              platform: 'pluggy',
              sandbox: true,
              connected_at: new Date().toISOString()
            }
          });

        if (error) {
          throw new Error(`Erro ao criar conexão: ${error.message}`);
        }
      }

      const newConnectionData = {
        itemId,
        accountData,
        transactionsData: null,
        isConnected: true,
        connectionToken
      };

      setConnectionData(newConnectionData);
      console.log('Conexão Pluggy salva com sucesso');
    } catch (error: any) {
      console.error('Erro ao salvar conexão:', error);
      toast({
        title: "Erro ao salvar conexão",
        description: error.message || "Não foi possível salvar a conexão. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [currentEmpresa?.id, toast]);

  const clearConnection = useCallback(async () => {
    if (!currentEmpresa?.id || !connectionData?.itemId) return;

    try {
      const { error } = await supabase
        .from('integracoes_bancarias')
        .update({ status: 'inativo' })
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', connectionData.itemId);

      if (error) {
        throw new Error(`Erro ao desativar conexão: ${error.message}`);
      }

      setConnectionData(null);
      console.log('Conexão Pluggy limpa');
    } catch (error: any) {
      console.error('Erro ao limpar conexão:', error);
      toast({
        title: "Erro ao limpar conexão",
        description: error.message || "Não foi possível limpar a conexão.",
        variant: "destructive",
      });
    }
  }, [currentEmpresa?.id, connectionData?.itemId, toast]);

  const updateConnectionData = useCallback((updates: Partial<PluggyConnectionData>) => {
    setConnectionData(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return {
    connectionData,
    setConnectionData,
    loadExistingConnection,
    saveConnection,
    clearConnection,
    updateConnectionData
  };
};
