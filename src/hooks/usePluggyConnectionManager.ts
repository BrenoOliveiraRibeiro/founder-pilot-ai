
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { usePluggyDatabase } from './usePluggyDatabase';
import { usePluggyDataSync } from './usePluggyDataSync';

export const usePluggyConnectionManager = () => {
  const [loading, setLoading] = useState(true);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const {
    connectionData,
    loadExistingConnection,
    saveConnection,
    clearConnection,
    updateConnectionData
  } = usePluggyDatabase();

  const { syncAccountData, fetchAccountData } = usePluggyDataSync();

  const initializeConnection = useCallback(async () => {
    if (!currentEmpresa?.id) {
      setLoading(false);
      return;
    }

    try {
      const existingConnection = await loadExistingConnection();
      
      if (existingConnection && !existingConnection.accountData && existingConnection.itemId) {
        const accountData = await syncAccountData(existingConnection.itemId);
        
        if (accountData) {
          updateConnectionData({ accountData });
        }
      }

      console.log('Estado da conexão Pluggy carregado com sucesso');
    } catch (error: any) {
      console.error('Erro ao carregar conexão existente:', error);
      toast({
        title: "Erro ao carregar conexão",
        description: error.message || "Não foi possível restaurar a conexão anterior. Você pode conectar novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentEmpresa?.id, loadExistingConnection, syncAccountData, updateConnectionData, toast]);

  useEffect(() => {
    initializeConnection();
  }, [initializeConnection]);

  return {
    connectionData,
    loading,
    saveConnection,
    clearConnection,
    updateConnectionData,
    fetchAccountData,
    initializeConnection
  };
};
