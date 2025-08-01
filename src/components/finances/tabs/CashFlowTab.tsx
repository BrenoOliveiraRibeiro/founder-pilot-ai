
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

interface MonthlyData {
  month: string;
  entrada: number;
  saida: number;
  resultado: number;
}

export const CashFlowTab: React.FC = () => {
  const { currentEmpresa } = useAuth();
  const [cashFlowData, setCashFlowData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCashFlowData = async () => {
      if (!currentEmpresa?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Buscar transações dos últimos 6 meses
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const { data: transacoes, error } = await supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .gte('data_transacao', sixMonthsAgo.toISOString().split('T')[0])
          .order('data_transacao', { ascending: true });

        if (error) throw error;

        // Processar dados por mês
        const monthlyDataMap = new Map<string, { entrada: number; saida: number }>();
        
        // Inicializar últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toISOString().substring(0, 7); // YYYY-MM
          const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
          monthlyDataMap.set(monthKey, { entrada: 0, saida: 0 });
        }

        // Agrupar transações por mês
        transacoes?.forEach(tx => {
          const txDate = new Date(tx.data_transacao);
          const monthKey = txDate.toISOString().substring(0, 7);
          
          if (monthlyDataMap.has(monthKey)) {
            const monthData = monthlyDataMap.get(monthKey)!;
            
            if (tx.tipo === 'receita' && tx.valor > 0) {
              monthData.entrada += Number(tx.valor);
            } else if (tx.tipo === 'despesa' && tx.valor < 0) {
              monthData.saida += Math.abs(Number(tx.valor));
            }
          }
        });

        // Converter para array formatado
        const formattedData: MonthlyData[] = [];
        monthlyDataMap.forEach((data, monthKey) => {
          const date = new Date(monthKey + '-01');
          const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
          
          formattedData.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            entrada: data.entrada,
            saida: data.saida,
            resultado: data.entrada - data.saida
          });
        });

        setCashFlowData(formattedData);
      } catch (error: any) {
        console.error('Erro ao buscar dados de fluxo de caixa:', error);
        setError(error.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowData();
  }, [currentEmpresa?.id]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mb-6">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Erro ao carregar dados</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (cashFlowData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Nenhum dado disponível</h3>
              <p className="text-sm text-muted-foreground">
                Conecte suas contas bancárias para ver o fluxo de caixa real
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>
          Entradas e saídas dos últimos 6 meses baseado em dados reais do Open Finance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis 
                tickFormatter={(value) => `R$${(value / 1000)}k`} 
              />
              <Tooltip 
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="entrada" 
                stroke="#22c55e" 
                name="Entradas"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="saida" 
                stroke="#ef4444" 
                name="Saídas"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="resultado" 
                stroke="#3b82f6" 
                name="Resultado"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="border rounded-md">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3">Mês</th>
                <th className="text-right p-3">Entradas</th>
                <th className="text-right p-3">Saídas</th>
                <th className="text-right p-3">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {cashFlowData.map((month, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 font-medium">{month.month}</td>
                  <td className="p-3 text-right text-green-500">{formatCurrency(month.entrada)}</td>
                  <td className="p-3 text-right text-red-500">{formatCurrency(month.saida)}</td>
                  <td className={`p-3 text-right font-medium ${
                    month.resultado >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(month.resultado)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            * Dados baseados em transações reais importadas via Open Finance
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
