
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PluggyAccount {
  id: string;
  name: string;
  balance: number;
  type: string;
  currencyCode: string;
}

interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  currencyCode: string;
}

interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  cashFlow: number;
}

export const usePluggyFinanceData = () => {
  const [accounts, setAccounts] = useState<PluggyAccount[]>([]);
  const [transactions, setTransactions] = useState<PluggyTransaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    cashFlow: 0
  });
  const [loading, setLoading] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const getCurrentMonth = () => {
    const now = new Date();
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0)
    };
  };

  const filterTransactionsByCurrentMonth = (transactions: PluggyTransaction[]) => {
    const { start, end } = getCurrentMonth();
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });
  };

  const calculateSummary = (accounts: PluggyAccount[], transactions: PluggyTransaction[]) => {
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
    
    const currentMonthTransactions = filterTransactionsByCurrentMonth(transactions);
    
    const monthlyIncome = currentMonthTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const monthlyExpenses = Math.abs(currentMonthTransactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + tx.amount, 0));
    
    const cashFlow = monthlyIncome - monthlyExpenses;

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      cashFlow
    };
  };

  const saveTransactionsToDatabase = async (transactions: PluggyTransaction[]) => {
    if (!currentEmpresa?.id) return;

    try {
      // Primeiro, limpar transações existentes do mês atual para evitar duplicatas
      const { start, end } = getCurrentMonth();
      
      await supabase
        .from('transacoes')
        .delete()
        .eq('empresa_id', currentEmpresa.id)
        .gte('data_transacao', start.toISOString().split('T')[0])
        .lte('data_transacao', end.toISOString().split('T')[0]);

      // Inserir novas transações
      const transactionsToInsert = transactions.map(tx => ({
        empresa_id: currentEmpresa.id,
        descricao: tx.description || 'Transação',
        valor: tx.amount,
        data_transacao: tx.date,
        categoria: tx.category || 'Outros',
        tipo: tx.amount > 0 ? 'receita' : 'despesa',
        metodo_pagamento: 'Open Finance',
        recorrente: false
      }));

      const { error } = await supabase
        .from('transacoes')
        .insert(transactionsToInsert);

      if (error) throw error;

      console.log(`${transactionsToInsert.length} transações salvas no banco de dados`);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar transações no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const saveMetricsToDatabase = async (summary: FinancialSummary) => {
    if (!currentEmpresa?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calcular runway (baseado em despesas mensais)
      const runwayMeses = summary.monthlyExpenses > 0 
        ? summary.totalBalance / summary.monthlyExpenses 
        : 0;

      const metricsData = {
        empresa_id: currentEmpresa.id,
        data_referencia: today,
        caixa_atual: summary.totalBalance,
        receita_mensal: summary.monthlyIncome,
        burn_rate: summary.monthlyExpenses,
        runway_meses: runwayMeses,
        cash_flow: summary.cashFlow,
        mrr_growth: 0 // Será calculado com dados históricos
      };

      // Verificar se já existe uma métrica para hoje
      const { data: existingMetric } = await supabase
        .from('metricas')
        .select('id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('data_referencia', today)
        .maybeSingle();

      if (existingMetric) {
        // Atualizar métrica existente
        await supabase
          .from('metricas')
          .update(metricsData)
          .eq('id', existingMetric.id);
      } else {
        // Inserir nova métrica
        await supabase
          .from('metricas')
          .insert(metricsData);
      }

      console.log('Métricas atualizadas no banco de dados');
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar métricas no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const updateFinancialData = (newAccounts: PluggyAccount[], newTransactions: PluggyTransaction[]) => {
    setAccounts(newAccounts);
    setTransactions(newTransactions);
    
    const newSummary = calculateSummary(newAccounts, newTransactions);
    setSummary(newSummary);
    
    // Salvar no banco de dados
    saveTransactionsToDatabase(newTransactions);
    saveMetricsToDatabase(newSummary);
  };

  const refreshFinancialData = async () => {
    if (accounts.length > 0 && transactions.length > 0) {
      const newSummary = calculateSummary(accounts, transactions);
      setSummary(newSummary);
      await saveMetricsToDatabase(newSummary);
    }
  };

  return {
    accounts,
    transactions,
    summary,
    loading,
    updateFinancialData,
    refreshFinancialData,
    getCurrentMonth,
    filterTransactionsByCurrentMonth
  };
};
