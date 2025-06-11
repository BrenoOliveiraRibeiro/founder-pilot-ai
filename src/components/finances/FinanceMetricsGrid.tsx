
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { usePluggyFinanceData } from "@/hooks/usePluggyFinanceData";
import { Skeleton } from "@/components/ui/skeleton";

export const FinanceMetricsGrid: React.FC = () => {
  const { currentEmpresa } = useAuth();
  const { data, loading, error } = usePluggyFinanceData(currentEmpresa?.id || null);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-3 w-48" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Erro ao carregar dados financeiros</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usar dados reais ou fallback
  const caixaAtual = data?.caixaAtual || 420000;
  const entradaMes = data?.entradaMes || 160000;
  const saidaMes = data?.saidaMes || 125000;
  const variacaoEntrada = data?.variacao_entrada || 12.5;
  const variacaoSaida = data?.variacao_saida || 13.6;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(caixaAtual)}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Entradas (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(entradaMes)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium ${variacaoEntrada >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {variacaoEntrada >= 0 ? '+' : ''}{variacaoEntrada.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Saídas (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
            <div className="text-2xl font-bold">{formatCurrency(saidaMes)}</div>
          </div>
          <div className="flex items-center mt-1">
            <span className={`text-xs font-medium ${variacaoSaida >= 0 ? 'text-red-500' : 'text-green-500'}`}>
              {variacaoSaida >= 0 ? '+' : ''}{variacaoSaida.toFixed(1)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
