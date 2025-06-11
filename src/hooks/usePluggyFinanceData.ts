
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PluggyTransaction {
  id: string;
  description: string;
  descriptionRaw?: string;
  amount: number;
  date: string;
  category?: string;
  categoryId?: string;
  currencyCode?: string;
  type: 'DEBIT' | 'CREDIT';
  accountId: string;
  status: string;
}

interface PluggyAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currencyCode: string;
}

interface PluggyApiResponse {
  total: number;
  totalPages: number;
  page: number;
  results: PluggyTransaction[];
}

interface FinanceMetrics {
  saldoTotal: number;
  entradasMesAtual: number;
  saidasMesAtual: number;
  cashFlow: number;
  burnRate: number;
  runwayMeses: number;
}

export const usePluggyFinanceData = () => {
  const [metrics, setMetrics] = useState<FinanceMetrics>({
    saldoTotal: 0,
    entradasMesAtual: 0,
    saidasMesAtual: 0,
    cashFlow: 0,
    burnRate: 0,
    runwayMeses: 0
  });
  const [loading, setLoading] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  // Função para obter data atual e filtros de período
  const getCurrentDateInfo = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Primeiro dia do mês atual
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    // Último dia do mês atual
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    return {
      now,
      currentYear,
      currentMonth,
      startOfMonth: startOfMonth.toISOString().split('T')[0],
      endOfMonth: endOfMonth.toISOString().split('T')[0],
      currentDate: now.toISOString().split('T')[0]
    };
  };

  const saveTransactionsToDatabase = async (transactions: PluggyTransaction[]) => {
    if (!currentEmpresa?.id) return;

    try {
      const transacoesFormatadas = transactions.map(tx => ({
        empresa_id: currentEmpresa.id,
        descricao: tx.description || tx.descriptionRaw || 'Transação',
        valor: tx.amount,
        data_transacao: new Date(tx.date).toISOString().split('T')[0],
        categoria: tx.category || 'Outros',
        tipo: tx.type === 'CREDIT' ? 'receita' : 'despesa',
        metodo_pagamento: 'Transferência',
        recorrente: false
      }));

      // Primeiro limpa transações antigas desta empresa
      await supabase
        .from('transacoes')
        .delete()
        .eq('empresa_id', currentEmpresa.id);

      // Insere as novas transações
      const { error } = await supabase
        .from('transacoes')
        .insert(transacoesFormatadas);

      if (error) throw error;

      console.log(`${transacoesFormatadas.length} transações salvas com sucesso`);
    } catch (error) {
      console.error('Erro ao salvar transações:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar transações no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const saveMetricsToDatabase = async (calculatedMetrics: FinanceMetrics) => {
    if (!currentEmpresa?.id) return;

    try {
      const { currentDate } = getCurrentDateInfo();
      
      const metricData = {
        empresa_id: currentEmpresa.id,
        data_referencia: currentDate,
        caixa_atual: calculatedMetrics.saldoTotal,
        receita_mensal: calculatedMetrics.entradasMesAtual,
        burn_rate: calculatedMetrics.burnRate,
        runway_meses: Math.round(calculatedMetrics.runwayMeses),
        cash_flow: calculatedMetrics.cashFlow,
        mrr_growth: 0 // Para ser calculado posteriormente
      };

      // Verifica se já existe uma métrica para hoje
      const { data: existingMetric } = await supabase
        .from('metricas')
        .select('id')
        .eq('empresa_id', currentEmpresa.id)
        .eq('data_referencia', currentDate)
        .single();

      if (existingMetric) {
        // Atualiza métrica existente
        const { error } = await supabase
          .from('metricas')
          .update(metricData)
          .eq('id', existingMetric.id);
        
        if (error) throw error;
      } else {
        // Cria nova métrica
        const { error } = await supabase
          .from('metricas')
          .insert([metricData]);
        
        if (error) throw error;
      }

      console.log('Métricas salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar métricas no banco de dados.",
        variant: "destructive",
      });
    }
  };

  const calculateMetrics = (accounts: PluggyAccount[], transactions: PluggyTransaction[]) => {
    const { startOfMonth, endOfMonth } = getCurrentDateInfo();
    
    // Saldo total (soma de todas as contas)
    const saldoTotal = accounts.reduce((total, account) => total + (account.balance || 0), 0);
    
    // Transações do mês atual
    const transacoesMesAtual = transactions.filter(tx => {
      const txDate = new Date(tx.date).toISOString().split('T')[0];
      return txDate >= startOfMonth && txDate <= endOfMonth;
    });
    
    // Entradas do mês atual (CREDIT)
    const entradasMesAtual = transacoesMesAtual
      .filter(tx => tx.type === 'CREDIT')
      .reduce((total, tx) => total + Math.abs(tx.amount), 0);
    
    // Saídas do mês atual (DEBIT)
    const saidasMesAtual = transacoesMesAtual
      .filter(tx => tx.type === 'DEBIT')
      .reduce((total, tx) => total + Math.abs(tx.amount), 0);
    
    // Cash flow (entradas - saídas)
    const cashFlow = entradasMesAtual - saidasMesAtual;
    
    // Burn rate (média de saídas mensais)
    const burnRate = saidasMesAtual;
    
    // Runway em meses (caixa atual / burn rate)
    const runwayMeses = burnRate > 0 ? saldoTotal / burnRate : 0;
    
    return {
      saldoTotal,
      entradasMesAtual,
      saidasMesAtual,
      cashFlow,
      burnRate,
      runwayMeses
    };
  };

  const processPluggyData = async (accounts: PluggyAccount[], transactionResponse: PluggyApiResponse) => {
    setLoading(true);
    
    try {
      // Extrair transações do response da API
      const transactions = transactionResponse.results;
      
      // Calcular métricas
      const calculatedMetrics = calculateMetrics(accounts, transactions);
      setMetrics(calculatedMetrics);
      
      // Salvar dados no banco
      await Promise.all([
        saveTransactionsToDatabase(transactions),
        saveMetricsToDatabase(calculatedMetrics)
      ]);
      
      toast({
        title: "Dados processados!",
        description: `${transactions.length} transações processadas e métricas atualizadas.`,
      });
      
    } catch (error) {
      console.error('Erro ao processar dados do Pluggy:', error);
      toast({
        title: "Erro",
        description: "Falha ao processar dados financeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMetricsFromDatabase = async () => {
    if (!currentEmpresa?.id) return;

    try {
      const { data, error } = await supabase
        .from('metricas')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .order('data_referencia', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setMetrics({
          saldoTotal: data.caixa_atual || 0,
          entradasMesAtual: data.receita_mensal || 0,
          saidasMesAtual: data.burn_rate || 0,
          cashFlow: data.cash_flow || 0,
          burnRate: data.burn_rate || 0,
          runwayMeses: data.runway_meses || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  useEffect(() => {
    loadMetricsFromDatabase();
  }, [currentEmpresa]);

  return {
    metrics,
    loading,
    processPluggyData,
    getCurrentDateInfo,
    loadMetricsFromDatabase
  };
};
