
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ProjectionChartProps {
  projectionData: Array<{
    month: string;
    cash: number;
  }>;
}

export const ProjectionChart: React.FC<ProjectionChartProps> = ({ projectionData }) => {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>Projeção de Caixa</CardTitle>
        <CardDescription>
          Previsão de caixa com base no burn rate atual
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tickFormatter={(value) => `${formatCurrency(value)}`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                formatter={(value) => [`${formatCurrency(Number(value))}`, 'Saldo']}
                labelFormatter={(label) => `Mês: ${label}`}
              />
              <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="cash" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
