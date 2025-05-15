
import { useState, useEffect } from 'react';
import { fromTransacoes } from '@/integrations/supabase/typedClient';
import { Transacao } from '@/integrations/supabase/models';

export const useFinanceTransactions = (empresaId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transacao[]>([]);

  useEffect(() => {
    if (!empresaId) return;

    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Buscar as transações recentes
        const { data: transactionData, error: transactionError } = await fromTransacoes()
          .select('*')
          .eq('empresa_id', empresaId)
          .order('data_transacao', { ascending: false })
          .limit(5);

        if (transactionError) throw transactionError;
        setTransactions(transactionData as Transacao[]);

      } catch (err: any) {
        console.error('Erro ao buscar transações:', err);
        setError('Falha ao carregar transações. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [empresaId]);

  return { 
    loading, 
    error, 
    transactions 
  };
};
