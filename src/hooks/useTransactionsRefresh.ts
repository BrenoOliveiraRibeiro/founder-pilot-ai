import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

export const useTransactionsRefresh = () => {
  const { currentEmpresa } = useAuth();
  const queryClient = useQueryClient();

  const refreshTransactions = async () => {
    if (!currentEmpresa?.id) return;

    try {
      // Invalidar cache para forçar nova busca das transações
      queryClient.invalidateQueries({ 
        queryKey: ['recent-transactions', currentEmpresa.id] 
      });
      
      console.log('Cache de transações invalidado para atualização');
    } catch (error) {
      console.error('Erro ao atualizar transações:', error);
    }
  };

  useEffect(() => {
    if (!currentEmpresa?.id) return;

    // Configurar intervalo de 30 segundos para atualização
    const interval = setInterval(refreshTransactions, 30 * 1000);

    return () => clearInterval(interval);
  }, [currentEmpresa?.id]);

  return { refreshTransactions };
};