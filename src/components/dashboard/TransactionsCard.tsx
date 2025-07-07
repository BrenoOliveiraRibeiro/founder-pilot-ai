
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transacao } from "@/integrations/supabase/models";
import { useTransactionsRefresh } from "@/hooks/useTransactionsRefresh";

export const TransactionsCard = () => {
  const { currentEmpresa } = useAuth();
  
  // Hook para sincronização automática de transações
  useTransactionsRefresh();

  // Buscar as 10 últimas transações do Supabase
  const { data: transactions = [], isLoading: loading } = useQuery({
    queryKey: ['recent-transactions', currentEmpresa?.id],
    queryFn: async () => {
      if (!currentEmpresa?.id) return [];
      
      const { data, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', currentEmpresa.id)
        .order('data_transacao', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao buscar transações:', error);
        return [];
      }

      return data as Transacao[];
    },
    enabled: !!currentEmpresa?.id,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Configuração de animações para lista
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="text-xl">Transações Recentes</CardTitle>
          <CardDescription>Últimas 10 transações salvas</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-none">
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2">
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
                  </Skeleton>
                  <Skeleton className="h-3 w-32">
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
                  </Skeleton>
                </div>
                <Skeleton className="h-4 w-20">
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
                </Skeleton>
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <motion.div 
            className="space-y-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {transactions.map((tx) => (
              <motion.div 
                key={tx.id}
                variants={itemVariants}
                className="flex items-center justify-between py-3 border-b border-border last:border-none"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{tx.descricao}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatDate(tx.data_transacao)}</span>
                    <span className="h-1 w-1 bg-muted-foreground rounded-full"></span>
                    <span>{tx.categoria}</span>
                    {tx.recorrente && (
                      <>
                        <span className="h-1 w-1 bg-muted-foreground rounded-full"></span>
                        <span>Recorrente</span>
                      </>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-medium ${
                  tx.valor > 0 ? "text-success" : "text-destructive"
                }`}>
                  {tx.valor > 0 ? "+" : ""}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(tx.valor)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p>Nenhuma transação encontrada.</p>
            <p className="text-sm mt-2">Conecte suas contas bancárias no Open Finance para ver suas transações.</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
