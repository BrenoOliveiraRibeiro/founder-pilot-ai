
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface FinanceOverviewTabProps {
  selectedDate?: Date;
}

export const FinanceOverviewTab: React.FC<FinanceOverviewTabProps> = ({ selectedDate }) => {
  const { currentEmpresa } = useAuth();
  const { 
    saldoCaixa, 
    entradasMesAtual, 
    saidasMesAtual, 
    fluxoCaixaMesAtual,
    loading 
  } = useTransactionsMetrics({ selectedDate });

  if (!currentEmpresa) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Selecione uma empresa para visualizar os dados financeiros
          </p>
        </CardContent>
      </Card>
    );
  }

  const mesAno = selectedDate ? format(selectedDate, "MMMM 'de' yyyy", { locale: pt }) : "mês atual";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo Financeiro - {mesAno}</CardTitle>
          <CardDescription>
            Visão geral das finanças da empresa para o período selecionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse h-4 bg-muted rounded w-3/4"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-1/2"></div>
              <div className="animate-pulse h-4 bg-muted rounded w-2/3"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Posição Financeira</h3>
                <p className="text-sm text-muted-foreground mb-1">Saldo em Caixa</p>
                <p className="text-2xl font-bold">{formatCurrency(saldoCaixa)}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Movimento do Mês</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Entradas:</span>
                    <span className="text-green-600 font-medium">{formatCurrency(entradasMesAtual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saídas:</span>
                    <span className="text-red-600 font-medium">{formatCurrency(saidasMesAtual)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Resultado:</span>
                    <span className={`font-bold ${fluxoCaixaMesAtual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(fluxoCaixaMesAtual)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
