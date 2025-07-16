import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { TransactionExportData, generateCSVContent, downloadCSV, generateFileName } from '@/utils/csvExporter';
import { format } from 'date-fns';

export const useTransactionExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const exportTransactions = useCallback(async (startDate: Date, endDate: Date) => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Empresa não identificada",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Format dates for database query
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Query transactions within date range
      const { data: transactions, error } = await supabase
        .from('transacoes')
        .select(`
          data_transacao,
          descricao,
          valor,
          tipo,
          categoria,
          metodo_pagamento
        `)
        .eq('empresa_id', currentEmpresa.id)
        .gte('data_transacao', startDateStr)
        .lte('data_transacao', endDateStr)
        .order('data_transacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar transações:', error);
        toast({
          title: "Erro ao exportar",
          description: "Não foi possível buscar as transações. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      if (!transactions || transactions.length === 0) {
        toast({
          title: "Nenhuma transação encontrada",
          description: "Não há transações no período selecionado.",
          variant: "destructive",
        });
        return;
      }

      // Query bank integrations to get bank names
      const { data: integrations } = await supabase
        .from('integracoes_bancarias')
        .select('nome_banco')
        .eq('empresa_id', currentEmpresa.id);

      // Add bank name to transactions (for now, use first integration)
      const bankName = integrations?.[0]?.nome_banco || 'Não identificado';
      
      const exportData: TransactionExportData[] = transactions.map(transaction => ({
        ...transaction,
        nome_banco: bankName
      }));

      // Generate CSV content
      const csvContent = generateCSVContent(exportData);
      
      // Generate filename
      const filename = generateFileName(startDate, endDate);
      
      // Download file
      downloadCSV(csvContent, filename);

      toast({
        title: "Exportação concluída",
        description: `${transactions.length} transações exportadas com sucesso.`,
      });

    } catch (error) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  }, [currentEmpresa?.id, toast]);

  return {
    exportTransactions,
    isExporting
  };
};