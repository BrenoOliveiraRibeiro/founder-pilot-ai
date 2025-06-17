
import { useState, useCallback } from 'react';
import { pluggyConnectionSchema, type PluggyConnection } from '@/schemas/validationSchemas';

export const usePluggyConnectionState = () => {
  const [connectionData, setConnectionData] = useState<PluggyConnection | null>(null);

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

  const clearConnectionData = useCallback(() => {
    setConnectionData(null);
  }, []);

  return {
    connectionData,
    setConnectionData,
    updateConnectionData,
    clearConnectionData
  };
};
