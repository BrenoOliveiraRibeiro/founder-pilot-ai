
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

const cashFlowData = [
  { month: 'Jan', entrada: 120000, saida: 90000 },
  { month: 'Fev', entrada: 130000, saida: 85000 },
  { month: 'Mar', entrada: 125000, saida: 95000 },
  { month: 'Abr', entrada: 140000, saida: 100000 },
  { month: 'Mai', entrada: 150000, saida: 110000 },
  { month: 'Jun', entrada: 160000, saida: 125000 },
];

export const CashFlowTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fluxo de Caixa</CardTitle>
        <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
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
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(month.entrada - month.saida)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
