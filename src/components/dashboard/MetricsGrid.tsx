
import React from "react";
import { MetricCard } from "./MetricCard";
import { 
  BanknoteIcon, 
  CalendarClock, 
  CreditCard, 
  DollarSign, 
  LineChart, 
  TrendingDown, 
  Wallet 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";

export const MetricsGrid = () => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);

  // Usar dados de métricas da API ou fallback para valores de exemplo
  const cashBalance = metrics?.caixa_atual ?? 124500;
  const monthlyRevenue = metrics?.receita_mensal ?? 45800;
  const monthlyBurn = metrics?.burn_rate ?? 38200;
  const runway = metrics?.runway_meses ?? 3.5;
  const mrrGrowth = metrics?.mrr_growth ?? 12.5;
  const burnRate = monthlyBurn / 4; // Semanal (ou do banco de dados se disponível)
  const cashFlow = metrics?.cash_flow ?? 7600;

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
      <MetricCard
        title="Saldo em Caixa"
        value={`R$${cashBalance.toLocaleString('pt-BR')}`}
        description="Total disponível"
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        tooltip="Seu saldo total em caixa em todas as contas conectadas"
        loading={loading}
      />
      
      <MetricCard
        title="Receita Mensal"
        value={`R$${monthlyRevenue.toLocaleString('pt-BR')}`}
        change={12}
        description="vs. mês anterior"
        icon={<BanknoteIcon className="h-5 w-5 text-primary" />}
        tooltip="Sua receita total para o mês atual"
        loading={loading}
      />
      
      <MetricCard
        title="Gastos Mensais"
        value={`R$${monthlyBurn.toLocaleString('pt-BR')}`}
        change={-8}
        description="vs. mês anterior"
        icon={<CreditCard className="h-5 w-5 text-primary" />}
        tooltip="Suas despesas totais para o mês atual"
        loading={loading}
      />
      
      <MetricCard
        title="Runway"
        value={`${runway.toLocaleString('pt-BR')} meses`}
        change={-15}
        description="na taxa atual de queima"
        icon={<CalendarClock className="h-5 w-5 text-warning" />}
        tooltip="Quanto tempo seu caixa durará na taxa atual de queima"
        className="border-warning/20 bg-warning/5"
        loading={loading}
      />
      
      <MetricCard
        title="Crescimento MRR"
        value={`${mrrGrowth}%`}
        change={3.2}
        description="vs. mês anterior"
        icon={<LineChart className="h-5 w-5 text-success" />}
        tooltip="Crescimento mês a mês em receita recorrente"
        className="border-success/20 bg-success/5"
        loading={loading}
      />
      
      <MetricCard
        title="Taxa de Queima"
        value={`R$${burnRate.toLocaleString('pt-BR')}`}
        description="média semanal"
        icon={<TrendingDown className="h-5 w-5 text-destructive" />}
        tooltip="Sua taxa média de gasto semanal"
        className="border-destructive/20 bg-destructive/5"
        loading={loading}
      />
      
      <MetricCard
        title="Fluxo de Caixa"
        value={`R$${cashFlow.toLocaleString('pt-BR')}`}
        change={-22}
        description="vs. mês anterior"
        icon={<Wallet className="h-5 w-5 text-primary" />}
        tooltip="Fluxo de caixa líquido (receita menos despesas)"
        loading={loading}
      />
    </div>
  );
};
