
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { pluggyConnectionSchema, type PluggyConnection } from '@/schemas/validationSchemas';

export const usePluggyDatabase = () => {
  const [connectionData, setConnectionData] = useState<PluggyConnection | null>(null);
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
        
        const connectionData: PluggyConnection = {
          itemId: integracao.item_id!,
          accountData: integracao.account_data,
          transactionsData: null,
          isConnected: true,
          connectionToken: integracao.connection_token || undefined
        };

        // Validar dados antes de definir estado
        const validatedConnection = pluggyConnectionSchema.parse(connectionData);
        setConnectionData(validatedConnection);
        return validatedConnection;
      }

      console.log('Nenhuma conexão Pluggy existente encontrada');
      return null;
    } catch (error: any) {
      console.error('Erro ao carregar conexão existente:', error);
      
      // Se for erro de validação Zod, mostrar erro mais específico
      if (error.name === 'ZodError') {
        toast({
          title: "Dados de conexão inválidos",
          description: `Erro de validação: ${error.errors.map((e: any) => e.message).join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao carregar conexão",
          description: error.message || "Não foi possível restaurar a conexão anterior. Você pode conectar novamente.",
          variant: "destructive",
        });
      }
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
      
      // Validar dados antes de salvar
      const connectionData: PluggyConnection = {
        itemId,
        accountData,
        transactionsData: null,
        isConnected: true,
        connectionToken
      };

      const validatedConnection = pluggyConnectionSchema.parse(connectionData);
      
      // Usar upsert para otimizar a operação
      const { error } = await supabase
        .from('integracoes_bancarias')
        .upsert({
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
        }, {
          onConflict: 'empresa_id,item_id'
        });

      if (error) {
        throw new Error(`Erro ao salvar conexão: ${error.message}`);
      }

      setConnectionData(validatedConnection);
      console.log('Conexão Pluggy salva com sucesso');
    } catch (error: any) {
      console.error('Erro ao salvar conexão:', error);
      
      // Se for erro de validação Zod, mostrar erro mais específico
      if (error.name === 'ZodError') {
        toast({
          title: "Dados de conexão inválidos",
          description: `Erro de validação: ${error.errors.map((e: any) => e.message).join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao salvar conexão",
          description: error.message || "Não foi possível salvar a conexão. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  }, [currentEmpresa?.id, toast]);

  const clearConnection = useCallback(async () => {
    if (!currentEmpresa?.id || !connectionData?.itemId) return;

    try {
      // Buscar a integração existente primeiro para obter o nome_banco
      const { data: existingIntegration, error: fetchError } = await supabase
        .from('integracoes_bancarias')
        .select('nome_banco')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', connectionData.itemId)
        .single();

      if (fetchError) {
        throw new Error(`Erro ao buscar integração: ${fetchError.message}`);
      }

      // Usar upsert para atualizar status de forma mais eficiente
      const { error } = await supabase
        .from('integracoes_bancarias')
        .upsert({
          empresa_id: currentEmpresa.id,
          item_id: connectionData.itemId,
          nome_banco: existingIntegration?.nome_banco || 'Banco Desconectado',
          tipo_conexao: 'Open Finance',
          status: 'inativo',
          ultimo_sincronismo: new Date().toISOString()
        }, {
          onConflict: 'empresa_id,item_id'
        });

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

  const updateConnectionData = useCallback((updates: Partial<PluggyConnection>) => {
    setConnectionData(prev => {
      if (!prev) return null;
      
      try {
        const updatedData = { ...prev, ...updates };
        const validatedData = pluggyConnectionSchema.parse(updatedData);
        return validatedData;
      } catch (error: any) {
        console.error('Erro ao validar atualização de conexão:', error);
        return prev;
      }
    });
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
