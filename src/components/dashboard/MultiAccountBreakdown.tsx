
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Building2 } from "lucide-react";

interface AccountSummary {
  bankName: string;
  totalBalance: number;
  accountCount: number;
  percentage: number;
  status: 'ativo' | 'inativo';
  lastSync: string | null;
}

interface MultiAccountBreakdownProps {
  accountsSummary: AccountSummary[];
  totalBalance: number;
  isLoading?: boolean;
}

export const MultiAccountBreakdown: React.FC<MultiAccountBreakdownProps> = ({
  accountsSummary,
  totalBalance,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Distribuição por Banco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accountsSummary.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Distribuição por Banco
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {accountsSummary.length} {accountsSummary.length === 1 ? 'banco' : 'bancos'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {accountsSummary.map((account, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{account.bankName}</span>
                <div className={`w-2 h-2 rounded-full ${
                  account.status === 'ativo' ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(account.totalBalance)}</div>
                <div className="text-xs text-muted-foreground">
                  {account.accountCount} {account.accountCount === 1 ? 'conta' : 'contas'}
                </div>
              </div>
            </div>
            
            <Progress value={account.percentage} className="h-2" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{account.percentage.toFixed(1)}% do total</span>
              <span>
                Sync: {account.lastSync ? 
                  new Date(account.lastSync).toLocaleDateString('pt-BR') : 
                  'Nunca'
                }
              </span>
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t">
          <div className="flex justify-between items-center font-bold">
            <span>Total Consolidado:</span>
            <span className="text-lg text-primary">{formatCurrency(totalBalance)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
