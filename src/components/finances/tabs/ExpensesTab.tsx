
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, TrendingDown, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
  transactions: number;
}

interface ExpensesTabProps {
  selectedDate?: Date;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ selectedDate }) => {
  const { currentEmpresa } = useAuth();
  const [expensesData, setExpensesData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState("3"); // meses
  const [comparisonData, setComparisonData] = useState<{ current: number; previous: number } | null>(null);

  useEffect(() => {
    const fetchExpensesData = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('=== BUSCANDO DADOS DE DESPESAS ===');
        console.log('Data selecionada no ExpensesTab:', selectedDate?.toISOString());
        console.log('Período selecionado:', selectedPeriod);

        const monthsAgo = parseInt(selectedPeriod);
        let startDate: Date;
        
        if (selectedDate) {
          // Se uma data específica foi selecionada, calcular a partir dela
          startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - monthsAgo + 1, 1);
        } else {
          // Caso contrário, usar a data atual
          startDate = new Date();
          startDate.setMonth(startDate.getMonth() - monthsAgo);
        }

        let endDate: Date;
        if (selectedDate) {
          // Último dia do mês selecionado
          endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        } else {
          endDate = new Date();
        }

        console.log('Período de análise:', startDate.toISOString(), 'até', endDate.toISOString());

        // Buscar transações de despesas do período selecionado
        const { data: currentTransactions, error: currentError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .eq('tipo', 'despesa')
          .gte('data_transacao', startDate.toISOString().split('T')[0])
          .lte('data_transacao', endDate.toISOString().split('T')[0])
          .order('data_transacao', { ascending: false });

        if (currentError) throw currentError;

        // Buscar transações do período anterior para comparação
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - monthsAgo);
        
        const previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);

        const { data: previousTransactions, error: previousError } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .eq('tipo', 'despesa')
          .gte('data_transacao', previousStartDate.toISOString().split('T')[0])
          .lte('data_transacao', previousEndDate.toISOString().split('T')[0]);

        if (previousError) throw previousError;

        if (currentTransactions && currentTransactions.length > 0) {
          // Agrupar por categoria
          const categoryTotals = currentTransactions.reduce((acc, transaction) => {
            const category = transaction.categoria || 'Outros';
            const amount = Math.abs(transaction.valor);
            
            if (!acc[category]) {
              acc[category] = { amount: 0, count: 0 };
            }
            acc[category].amount += amount;
            acc[category].count += 1;
            
            return acc;
          }, {} as Record<string, { amount: number; count: number }>);

          const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.amount, 0);
          setTotalExpenses(total);

          // Converter para array e calcular percentuais
          const expensesArray: ExpenseData[] = Object.entries(categoryTotals)
            .map(([category, data]) => ({
              category,
              amount: data.amount,
              percentage: total > 0 ? (data.amount / total) * 100 : 0,
              transactions: data.count
            }))
            .sort((a, b) => b.amount - a.amount);

          setExpensesData(expensesArray);

          // Calcular comparação com período anterior
          if (previousTransactions && previousTransactions.length > 0) {
            const previousTotal = previousTransactions.reduce((sum, tx) => sum + Math.abs(tx.valor), 0);
            setComparisonData({ current: total, previous: previousTotal });
          }
        } else {
          setExpensesData([]);
          setTotalExpenses(0);
          setComparisonData(null);
        }
      } catch (error: any) {
        console.error('Erro ao buscar dados de despesas:', error);
        setError(error.message || 'Erro ao carregar dados de despesas');
      } finally {
        setLoading(false);
      }
    };

    fetchExpensesData();
  }, [currentEmpresa?.id, selectedPeriod, selectedDate]);

  const getComparisonText = () => {
    if (!comparisonData) return null;
    
    const change = comparisonData.current - comparisonData.previous;
    const changePercent = comparisonData.previous > 0 ? (change / comparisonData.previous) * 100 : 0;
    
    if (Math.abs(changePercent) < 1) return null;
    
    return {
      text: `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}% vs período anterior`,
      isIncrease: changePercent > 0
    };
  };

  const comparison = getComparisonText();
  const periodDescription = selectedDate 
    ? `baseado em ${format(selectedDate, "MMMM 'de' yyyy", { locale: pt })}` 
    : "período atual";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Despesas</CardTitle>
          <CardDescription>Detalhamento das principais categorias de despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[...Array(5)].map((_, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-2.5 w-full mb-1" />
                <div className="text-right">
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Erro ao carregar dados</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expensesData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análise de Despesas</CardTitle>
          <CardDescription>Detalhamento das principais categorias de despesas</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <TrendingDown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">Nenhuma despesa encontrada</h3>
            <p className="text-sm text-muted-foreground">
              Conecte suas contas bancárias para ver análise de despesas
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Análise de Despesas
              <span className="text-lg font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </span>
            </CardTitle>
            <CardDescription>
              Detalhamento das principais categorias de despesas ({periodDescription})
              {comparison && (
                <span className={`ml-2 text-sm font-medium ${
                  comparison.isIncrease ? 'text-red-600' : 'text-green-600'
                }`}>
                  {comparison.text}
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Último mês</SelectItem>
                <SelectItem value="3">3 meses</SelectItem>
                <SelectItem value="6">6 meses</SelectItem>
                <SelectItem value="12">12 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {expensesData.map((expense, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{expense.category}</span>
                  <span className="text-xs text-muted-foreground">
                    ({expense.transactions} transações)
                  </span>
                </div>
                <span className="font-bold text-red-600">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                <div 
                  className="h-2.5 rounded-full bg-red-500"
                  style={{ width: `${expense.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {expense.percentage.toFixed(1)}% do total
              </div>
            </div>
          ))}
          
          {expensesData.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                * Dados baseados em transações reais dos últimos {selectedPeriod} meses ({periodDescription})
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
