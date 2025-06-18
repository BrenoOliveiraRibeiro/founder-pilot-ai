
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Filter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const TransactionsCard = () => {
  const { currentEmpresa } = useAuth();
  const { loading, transactions } = useFinanceData(currentEmpresa?.id || null);

  // Se não houver dados reais, usar um conjunto de exemplos
  const transactionsToDisplay = transactions.length > 0 ? transactions : [
    {
      id: "tx1",
      empresa_id: "",
      descricao: "AWS Cloud Services",
      valor: -1240,
      data_transacao: "2023-10-23",
      categoria: "Infraestrutura",
      tipo: "despesa" as const,
      metodo_pagamento: "Cartão",
      recorrente: true,
      created_at: "",
    },
    {
      id: "tx2",
      empresa_id: "",
      descricao: "Pagamento Cliente - Acme Corp",
      valor: 5000,
      data_transacao: "2023-10-22",
      categoria: "Receita",
      tipo: "receita" as const,
      metodo_pagamento: "Transferência",
      recorrente: false,
      created_at: "",
    },
    {
      id: "tx3",
      empresa_id: "",
      descricao: "Aluguel do Escritório",
      valor: -3500,
      data_transacao: "2023-10-20",
      categoria: "Instalações",
      tipo: "despesa" as const,
      metodo_pagamento: "Débito",
      recorrente: true,
      created_at: "",
    },
    {
      id: "tx4",
      empresa_id: "",
      descricao: "Assinaturas SaaS",
      valor: -890,
      data_transacao: "2023-10-19",
      categoria: "Software",
      tipo: "despesa" as const,
      metodo_pagamento: "Cartão",
      recorrente: true,
      created_at: "",
    },
    {
      id: "tx5",
      empresa_id: "",
      descricao: "Pagamento Cliente - TechStart Inc",
      valor: 3500,
      data_transacao: "2023-10-18",
      categoria: "Receita",
      tipo: "receita" as const,
      metodo_pagamento: "Transferência",
      recorrente: false,
      created_at: "",
    },
  ];

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
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">Transações Recentes</CardTitle>
            <CardDescription>Últimos 30 dias de atividade</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
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
        ) : (
          <motion.div 
            className="space-y-2"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {transactionsToDisplay.map((tx) => (
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
        )}
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-4 flex justify-center"
        >
          <Button variant="ghost" size="sm" className="text-primary">
            <Eye className="h-4 w-4 mr-2" />
            Ver Todas as Transações
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};
