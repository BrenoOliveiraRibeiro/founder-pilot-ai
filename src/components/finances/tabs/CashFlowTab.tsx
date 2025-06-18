
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface MonthlyData {
  month: string;
  monthYear: string;
  entrada: number;
  saida: number;
  resultado: number;
}

interface CashFlowTabProps {
  selectedDate?: Date;
}

export const CashFlowTab: React.FC<CashFlowTabProps> = ({ selectedDate }) => {
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

        console.log('=== BUSCANDO DADOS PARA GRÁFICO DE FLUXO ===');
        console.log('Data selecionada no CashFlowTab:', selectedDate?.toISOString());

        // Buscar transações com filtro até a data selecionada se fornecida
        let query = supabase
          .from('transacoes')
          .select('*')
          .eq('empresa_id', currentEmpresa.id)
          .order('data_transacao', { ascending: true });

        // Se uma data específica foi selecionada, filtrar até ela
        if (selectedDate) {
          const endOfSelectedMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
          const endOfSelectedMonthStr = `${endOfSelectedMonth.getFullYear()}-${String(endOfSelectedMonth.getMonth() + 1).padStart(2, '0')}-${String(endOfSelectedMonth.getDate()).padStart(2, '0')}`;
          query = query.lte('data_transacao', endOfSelectedMonthStr);
          
          console.log('Filtrando até:', endOfSelectedMonthStr);
        }

        const { data: transacoes, error } = await query;

        if (error) throw error;

        console.log('Total de transações encontradas:', transacoes?.length || 0);

        if (!transacoes || transacoes.length === 0) {
          setCashFlowData([]);
          return;
        }

        // Agrupar transações por mês/ano
        const monthlyDataMap = new Map<string, { entrada: number; saida: number; monthYear: string }>();
        
        transacoes.forEach(tx => {
          const txDate = new Date(tx.data_transacao + 'T00:00:00'); // Forçar timezone local
          const year = txDate.getFullYear();
          const month = txDate.getMonth(); // 0-based
          const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
          
          const monthName = txDate.toLocaleDateString('pt-BR', { month: 'short' });
          const monthYear = `${monthName}/${year}`;
          
          if (!monthlyDataMap.has(monthKey)) {
            monthlyDataMap.set(monthKey, { 
              entrada: 0, 
              saida: 0, 
              monthYear 
            });
          }
          
          const monthData = monthlyDataMap.get(monthKey)!;
          const valor = Number(tx.valor) || 0;
          
          if (valor > 0) {
            monthData.entrada += valor;
          } else {
            monthData.saida += Math.abs(valor);
          }
        });

        // Converter para array e ordenar por data
        const formattedData: MonthlyData[] = [];
        
        // Ordenar as chaves do mapa
        const sortedKeys = Array.from(monthlyDataMap.keys()).sort();
        
        sortedKeys.forEach(monthKey => {
          const data = monthlyDataMap.get(monthKey)!;
          const [year, month] = monthKey.split('-');
          const date = new Date(Number(year), Number(month) - 1);
          const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
          
          formattedData.push({
            month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            monthYear: data.monthYear,
            entrada: data.entrada,
            saida: data.saida,
            resultado: data.entrada - data.saida
          });
        });

        console.log('Dados agrupados por mês:', formattedData);
        setCashFlowData(formattedData);
      } catch (error: any) {
        console.error('Erro ao buscar dados de fluxo de caixa:', error);
        setError(error.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlowData();
  }, [currentEmpresa?.id, selectedDate]);

  const periodDescription = selectedDate 
    ? `até ${format(selectedDate, "MMMM 'de' yyyy", { locale: pt })}` 
    : "dos últimos meses";

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
          <CardDescription>Entradas e saídas {periodDescription}</CardDescription>
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
          <CardDescription>Entradas e saídas {periodDescription}</CardDescription>
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
          <CardDescription>Entradas e saídas {periodDescription}</CardDescription>
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
          Entradas e saídas agrupadas por mês {periodDescription}
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
                  <td className="p-3 font-medium">{month.monthYear}</td>
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
            * Dados agrupados por mês baseados nas datas das transações {periodDescription}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
