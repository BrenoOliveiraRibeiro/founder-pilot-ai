
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useTransactionProcessor } from './pluggy/useTransactionProcessor';
import { useTransactionCache } from './pluggy/useTransactionCache';

interface ProcessedTransactionsResult {
  success: boolean;
  message: string;
  newTransactions?: number;
  totalTransactions?: number;
  skippedDuplicates?: number;
  error?: string;
}

export const usePluggyTransactions = () => {
  const [processingTransactions, setProcessingTransactions] = useState(false);
  const { currentEmpresa } = useAuth();
  
  const { processTransactions } = useTransactionProcessor();
  const { 
    lastSyncTimestamps, 
    setLastSyncTimestamps,
    checkCacheValidity,
    updateCache
  } = useTransactionCache();

  const processAndSaveTransactions = useCallback(async (
    itemId: string, 
    accountId: string, 
    transactionsData: any
  ): Promise<ProcessedTransactionsResult> => {
    if (!currentEmpresa?.id || !transactionsData?.results || processingTransactions) {
      return { 
        success: false, 
        message: 'Dados inválidos ou processamento já em andamento',
        error: 'Invalid data or processing already in progress'
      };
    }

    // Verificar cache
    if (checkCacheValidity(itemId, accountId)) {
      return {
        success: true,
        message: 'Dados sincronizados recentemente.',
        newTransactions: 0,
        totalTransactions: transactionsData.results.length,
        skippedDuplicates: 0
      };
    }

    setProcessingTransactions(true);

    try {
      const result = await processTransactions(itemId, accountId, transactionsData);
      
      if (result.success) {
        updateCache(itemId, accountId);
      }
      
      return result;
    } finally {
      setProcessingTransactions(false);
    }
  }, [currentEmpresa?.id, processingTransactions, processTransactions, checkCacheValidity, updateCache]);

  const upsertIntegrationStatus = useCallback(async (itemId: string, status: string) => {
    if (!currentEmpresa?.id) return;

    try {
      // Buscar a integração existente primeiro para obter campos obrigatórios
      const { data: existingIntegration, error: fetchError } = await supabase
        .from('integracoes_bancarias')
        .select('nome_banco')
        .eq('empresa_id', currentEmpresa.id)
        .eq('item_id', itemId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao buscar integração existente:', fetchError);
        return;
      }

      const { error } = await supabase
        .from('integracoes_bancarias')
        .upsert({
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          nome_banco: existingIntegration?.nome_banco || 'Banco via Open Finance',
          tipo_conexao: 'Open Finance',
          status: status,
          ultimo_sincronismo: new Date().toISOString()
        }, {
          onConflict: 'empresa_id,item_id'
        });

      if (error) {
        console.error('Erro ao atualizar status da integração:', error);
      }
    } catch (error) {
      console.error('Erro inesperado ao atualizar integração:', error);
    }
  }, [currentEmpresa?.id]);

  return {
    processingTransactions,
    processAndSaveTransactions,
    upsertIntegrationStatus,
    lastSyncTimestamps,
    setLastSyncTimestamps
  };
};
