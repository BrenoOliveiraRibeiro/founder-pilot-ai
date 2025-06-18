
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Filter, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { usePluggyConnectionPersistence } from "@/hooks/usePluggyConnectionPersistence";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export const TransactionsCard = () => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading: openFinanceLoading } = useOpenFinanceDashboard();
  const { activeIntegrations, syncing, handleSyncData } = useOpenFinanceConnections();
  const { connectionData } = usePluggyConnectionPersistence();

  // Determinar se usar dados do Open Finance
  const hasOpenFinanceData = metrics && metrics.integracoesAtivas > 0;
  const hasPluggyConnection = connectionData?.isConnected;
  
  // Usar dados do Pluggy se disponível
  const transactions = connectionData?.transactionsData?.results || [];
  const loading = openFinanceLoading;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  // Função para sincronizar todas as integrações
  const handleSyncAll = async () => {
    if (activeIntegrations.length > 0) {
      // Sincronizar a primeira integração ativa
      await handleSyncData(activeIntegrations[0].id);
    }
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

  // Converter transações do Pluggy para o formato esperado
  const transactionsToDisplay = transactions.map(tx => ({
    id: tx.id || Math.random().toString(),
    descricao: tx.description || 'Transação',
    valor: tx.amount || 0,
    data_transacao: tx.date,
    categoria: tx.category || 'Outros',
    recorrente: false
  }));

  // Mostrar apenas as 5 transações mais recentes
  const recentTransactions = transactionsToDisplay
    .sort((a, b) => new Date(b.data_transacao).getTime() - new Date(a.data_transacao).getTime())
    .slice(0, 5);

  const isSyncing = syncing !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              Transações Recentes
              {(hasOpenFinanceData || hasPluggyConnection) && transactionsToDisplay.length > 0 && (
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-normal">
                  Dados Reais
                </span>
              )}
            </CardTitle>
            <CardDescription>
              {hasPluggyConnection && transactionsToDisplay.length > 0
                ? `Últimas transações das suas contas conectadas via Pluggy`
                : hasOpenFinanceData && transactionsToDisplay.length > 0
                ? `Últimas transações das suas ${metrics.integracoesAtivas} contas conectadas`
                : hasOpenFinanceData
                ? `${metrics.integracoesAtivas} contas conectadas - aguardando sincronização`
                : "Conecte suas contas bancárias para ver transações reais"
              }
            </CardDescription>
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
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
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
                    tx.valor > 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {tx.valor > 0 ? "+" : ""}
                    {formatCurrency(Math.abs(tx.valor))}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {hasOpenFinanceData ? (
                  <div className="space-y-3">
                    <p>Nenhuma transação sincronizada ainda</p>
                    <p className="text-sm">
                      Suas {metrics.integracoesAtivas} contas estão conectadas.
                      As transações aparecerão aqui após a próxima sincronização.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={handleSyncAll}
                      disabled={isSyncing || activeIntegrations.length === 0}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                      {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p>Conecte suas contas bancárias</p>
                    <p className="text-sm">
                      Para ver suas transações reais aqui, conecte suas contas via Open Finance
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Conectar Contas
                    </Button>
                  </div>
                )}
              </div>
            )}
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
        
        {hasOpenFinanceData && metrics.ultimaAtualizacao && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Última sincronização: {new Date(metrics.ultimaAtualizacao).toLocaleString('pt-BR')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
