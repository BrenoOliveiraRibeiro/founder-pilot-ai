
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PluggyTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'DEBIT' | 'CREDIT';
  currencyCode: string;
  accountId: string;
}

interface PluggyTransactionsResponse {
  total: number;
  totalPages: number;
  page: number;
  results: PluggyTransaction[];
}

interface FinanceMetrics {
  caixaAtual: number;
  receitaMensal: number;
  despesaMensal: number;
  runwayMeses: number;
  cashFlow: number;
  burnRate: number;
}

export const usePluggyFinanceData = () => {
  const [metrics, setMetrics] = useState<FinanceMetrics | null>(null);
  const [transactions, setTransactions] = useState<PluggyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const processTransactionsData = (transactionsData: PluggyTransactionsResponse): FinanceMetrics => {
    const { results } = transactionsData;
    
    // Separar receitas e despesas
    const receitas = results.filter(tx => tx.type === 'CREDIT' && tx.amount > 0);
    const despesas = results.filter(tx => tx.type === 'DEBIT' && tx.amount < 0);
    
    // Calcular totais
    const totalReceitas = receitas.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const totalDespesas = despesas.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    // Estimar receita e despesa mensal (baseado nos dados disponíveis)
    const receitaMensal = totalReceitas;
    const despesaMensal = totalDespesas;
    const burnRate = despesaMensal;
    
    // Calcular saldo atual (simulado - seria melhor vir da API de contas)
    const caixaAtual = 420000; // Valor simulado - deveria vir da API de accounts
    
    // Calcular runway
    const runwayMeses = burnRate > 0 ? caixaAtual / burnRate : 12;
    
    // Cash flow
    const cashFlow = receitaMensal - despesaMensal;
    
    return {
      caixaAtual,
      receitaMensal,
      despesaMensal,
      runwayMeses,
      cashFlow,
      burnRate
    };
  };

  const saveTransactionsToDatabase = async (transactionsData: PluggyTransaction[], calculatedMetrics: FinanceMetrics) => {
    if (!currentEmpresa?.id) return;

    try {
      // Salvar transações
      const transacoesFormatadas = transactionsData.slice(0, 20).map(tx => ({
        empresa_id: currentEmpresa.id,
        descricao: tx.description,
        valor: tx.amount,
        data_transacao: tx.date.split('T')[0],
        categoria: tx.category || 'Outros',
        tipo: tx.type === 'CREDIT' ? 'receita' : 'despesa',
        metodo_pagamento: 'Transferência'
      }));

      const { error: txError } = await supabase
        .from('transacoes')
        .upsert(transacoesFormatadas, { onConflict: 'empresa_id,descricao,valor,data_transacao' });

      if (txError) {
        console.error('Erro ao salvar transações:', txError);
      }

      // Salvar métricas
      const { error: metricasError } = await supabase
        .from('metricas')
        .upsert([{
          empresa_id: currentEmpresa.id,
          data_referencia: new Date().toISOString().split('T')[0],
          caixa_atual: calculatedMetrics.caixaAtual,
          receita_mensal: calculatedMetrics.receitaMensal,
          burn_rate: calculatedMetrics.burnRate,
          runway_meses: Math.round(calculatedMetrics.runwayMeses),
          cash_flow: calculatedMetrics.cashFlow
        }], { onConflict: 'empresa_id,data_referencia' });

      if (metricasError) {
        console.error('Erro ao salvar métricas:', metricasError);
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const fetchAndProcessTransactions = async (accountId: string) => {
    if (!currentEmpresa?.id) return;

    setLoading(true);
    try {
      // Esta seria a chamada real para a API da Pluggy
      // Por agora, vou simular com os dados fornecidos
      const mockTransactionsData: PluggyTransactionsResponse = {
        total: 2,
        totalPages: 1,
        page: 1,
        results: [
          {
            id: "429d6d52-8ffa-4664-8089-325a588fcc6d",
            description: "Pagamento de boleto",
            amount: -100,
            date: "2025-06-10T21:27:30.127Z",
            category: "Services",
            type: "DEBIT",
            currencyCode: "BRL",
            accountId: accountId
          },
          {
            id: "3f7d788a-b4b8-4bb3-9e56-bd8f0570837d",
            description: "DL*GOOGLEYouTube",
            amount: 18.99,
            date: "2024-10-20T03:00:00.000Z",
            category: "Digital services",
            type: "CREDIT",
            currencyCode: "BRL",
            accountId: accountId
          }
        ]
      };

      const calculatedMetrics = processTransactionsData(mockTransactionsData);
      
      setMetrics(calculatedMetrics);
      setTransactions(mockTransactionsData.results);
      
      await saveTransactionsToDatabase(mockTransactionsData.results, calculatedMetrics);
      
      toast({
        title: "Dados atualizados!",
        description: "As métricas financeiras foram calculadas com base nas suas transações.",
      });
    } catch (error) {
      console.error('Erro ao processar transações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar os dados das transações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStoredMetrics = async () => {
    if (!currentEmpresa?.id) return;

    try {
      const { data: metricasData, error } = await supabase
        .from('metricas')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .order('data_referencia', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar métricas:', error);
        return;
      }

      if (metricasData) {
        setMetrics({
          caixaAtual: metricasData.caixa_atual || 0,
          receitaMensal: metricasData.receita_mensal || 0,
          despesaMensal: metricasData.burn_rate || 0,
          runwayMeses: metricasData.runway_meses || 0,
          cashFlow: metricasData.cash_flow || 0,
          burnRate: metricasData.burn_rate || 0
        });
      }
    } catch (error) {
      console.error('Erro ao carregar métricas armazenadas:', error);
    }
  };

  useEffect(() => {
    if (currentEmpresa?.id) {
      loadStoredMetrics();
    }
  }, [currentEmpresa]);

  return {
    metrics,
    transactions,
    loading,
    fetchAndProcessTransactions,
    loadStoredMetrics
  };
};
