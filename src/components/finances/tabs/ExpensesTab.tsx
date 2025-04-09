
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export const ExpensesTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Análise de Despesas</CardTitle>
        <CardDescription>Detalhamento das principais categorias de despesas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {[
            { category: "Pessoal", amount: 75000, percentage: 60 },
            { category: "Marketing", amount: 25000, percentage: 20 },
            { category: "Infraestrutura", amount: 12500, percentage: 10 },
            { category: "Software", amount: 7500, percentage: 6 },
            { category: "Outros", amount: 5000, percentage: 4 }
          ].map((expense, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{expense.category}</span>
                <span>{formatCurrency(expense.amount)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                <div 
                  className="h-2.5 rounded-full bg-primary"
                  style={{ width: `${expense.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {expense.percentage}% do total
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
