
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProcessedTransactionsResult {
  success: boolean;
  message: string;
  newTransactions?: number;
  totalTransactions?: number;
  skippedDuplicates?: number;
  error?: string;
}

export const useTransactionProcessor = () => {
  const { currentEmpresa } = useAuth();
  const { toast } = useToast();

  const processTransactions = useCallback(async (
    itemId: string, 
    accountId: string, 
    transactionsData: any
  ): Promise<ProcessedTransactionsResult> => {
    if (!currentEmpresa?.id || !transactionsData?.results) {
      return { 
        success: false, 
        message: 'Dados inválidos para processamento',
        error: 'Invalid data for processing'
      };
    }

    try {
      console.log('Processando transações automaticamente...');
      
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "process_financial_data",
          empresa_id: currentEmpresa.id,
          item_id: itemId,
          account_id: accountId,
          transactions_data: transactionsData,
          sandbox: true
        }
      });

      if (error) {
        console.error("Erro na chamada da edge function:", error);
        
        let errorMessage = 'Erro desconhecido ao processar transações';
        
        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.context && error.context.error) {
          errorMessage = error.context.error;
        }

        return { 
          success: false, 
          message: errorMessage,
          error: errorMessage
        };
      }

      if (data?.error) {
        console.error("Erro retornado pela edge function:", data.error);
        return { 
          success: false, 
          message: data.message || data.error,
          error: data.error
        };
      }

      console.log("Transações processadas automaticamente:", data);
      
      // Mostrar toast apenas se houver transações novas
      if (data?.newTransactions > 0) {
        toast({
          title: "Transações salvas automaticamente",
          description: `${data.newTransactions} novas transações foram processadas e salvas.`,
        });
      }

      return { 
        success: true, 
        message: data?.message || 'Transações processadas com sucesso',
        newTransactions: data?.newTransactions || 0,
        totalTransactions: transactionsData.results.length,
        skippedDuplicates: data?.duplicates || 0
      };

    } catch (error: any) {
      console.error("Erro inesperado ao processar transações:", error);
      
      let errorMessage = 'Erro interno ao processar transações';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage
      };
    }
  }, [currentEmpresa?.id, toast]);

  return {
    processTransactions
  };
};
