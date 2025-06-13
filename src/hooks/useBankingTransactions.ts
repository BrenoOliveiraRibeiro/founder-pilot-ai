import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TransacaoBancaria } from '@/integrations/supabase/models';
import { useToast } from '@/components/ui/use-toast';

export const useBankingTransactions = () => {
  const [transactions, setTransactions] = useState<TransacaoBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async (accountId?: string, limit = 100) => {
    if (!currentEmpresa?.id) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let query = supabase
        .from("transacoes_bancarias")
        .select("*")
        .eq("empresa_id", currentEmpresa.id)
        .order("data_transacao", { ascending: false })
        .limit(limit);

      if (accountId) {
        query = query.eq("account_id", accountId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setTransactions(data as TransacaoBancaria[]);
      
      // Calculate total balance from latest transactions per account
      const latestByAccount = new Map();
      data?.forEach(tx => {
        if (tx.balance_after !== null && (!latestByAccount.has(tx.account_id) || 
            new Date(tx.data_transacao) > new Date(latestByAccount.get(tx.account_id).data_transacao))) {
          latestByAccount.set(tx.account_id, tx);
        }
      });
      
      const total = Array.from(latestByAccount.values())
        .reduce((sum, tx) => sum + (tx.balance_after || 0), 0);
      setTotalBalance(total);
      
    } catch (error) {
      console.error("Erro ao buscar transações bancárias:", error);
      toast({
        title: "Erro ao carregar transações",
        description: "Não foi possível carregar as transações bancárias. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionsByCategory = () => {
    const categoryMap = new Map();
    
    transactions.forEach(tx => {
      const category = tx.categoria || 'Outros';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { receitas: 0, despesas: 0, total: 0 });
      }
      
      const catData = categoryMap.get(category);
      if (tx.tipo === 'receita') {
        catData.receitas += Math.abs(tx.valor);
      } else {
        catData.despesas += Math.abs(tx.valor);
      }
      catData.total += tx.valor;
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    }));
  };

  const getMonthlyTrend = () => {
    const monthlyMap = new Map();
    
    transactions.forEach(tx => {
      const month = tx.data_transacao.substring(0, 7); // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { receitas: 0, despesas: 0, balance: 0 });
      }
      
      const monthData = monthlyMap.get(month);
      if (tx.tipo === 'receita') {
        monthData.receitas += Math.abs(tx.valor);
      } else {
        monthData.despesas += Math.abs(tx.valor);
      }
      monthData.balance = monthData.receitas - monthData.despesas;
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getUniqueAccounts = () => {
    const accountsMap = new Map();
    
    transactions.forEach(tx => {
      if (!accountsMap.has(tx.account_id)) {
        accountsMap.set(tx.account_id, {
          account_id: tx.account_id,
          balance_after: tx.balance_after,
          transaction_count: 0,
          last_transaction: tx.data_transacao
        });
      }
      
      const account = accountsMap.get(tx.account_id);
      account.transaction_count++;
      
      // Keep the most recent balance
      if (new Date(tx.data_transacao) > new Date(account.last_transaction)) {
        account.balance_after = tx.balance_after;
        account.last_transaction = tx.data_transacao;
      }
    });
    
    return Array.from(accountsMap.values());
  };

  useEffect(() => {
    if (currentEmpresa?.id) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setTotalBalance(0);
    }
  }, [currentEmpresa]);

  const formatCurrency = (amount: number, currencyCode = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return {
    transactions,
    loading,
    totalBalance,
    fetchTransactions,
    getTransactionsByCategory,
    getMonthlyTrend,
    getUniqueAccounts,
    formatCurrency,
    formatDate
  };
};
