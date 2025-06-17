
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { usePluggyDatabaseOperations } from './usePluggyDatabaseOperations';
import { usePluggyConnectionState } from './usePluggyConnectionState';

export const usePluggyDatabase = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();
  
  const {
    loadExistingConnection: loadFromDatabase,
    saveConnection: saveToDatabase,
    clearConnection: clearFromDatabase
  } = usePluggyDatabaseOperations();

  const {
    connectionData,
    setConnectionData,
    updateConnectionData,
    clearConnectionData
  } = usePluggyConnectionState();

  const loadExistingConnection = useCallback(async () => {
    try {
      const connection = await loadFromDatabase();
      if (connection) {
        setConnectionData(connection);
      }
      return connection;
    } catch (error: any) {
      console.error('Erro ao carregar conexão:', error);
      return null;
    }
  }, [loadFromDatabase, setConnectionData]);

  const saveConnection = useCallback(async (
    itemId: string, 
    accountData: any, 
    connectionToken?: string,
    bankName?: string
  ) => {
    try {
      const validatedConnection = await saveToDatabase(itemId, accountData, connectionToken, bankName);
      setConnectionData(validatedConnection);
    } catch (error: any) {
      console.error('Erro ao salvar conexão:', error);
      // Error handling is done in the database operations hook
    }
  }, [saveToDatabase, setConnectionData]);

  const clearConnection = useCallback(async () => {
    if (!connectionData?.itemId) return;

    try {
      await clearFromDatabase(connectionData.itemId);
      clearConnectionData();
    } catch (error: any) {
      console.error('Erro ao limpar conexão:', error);
      // Error handling is done in the database operations hook
    }
  }, [connectionData?.itemId, clearFromDatabase, clearConnectionData]);

  return {
    connectionData,
    setConnectionData,
    loadExistingConnection,
    saveConnection,
    clearConnection,
    updateConnectionData
  };
};
