
import React from "react";
import { DashboardHeader } from "./DashboardHeader";
import { OpenFinanceMetricsGrid } from "./OpenFinanceMetricsGrid";
import { MetricsGrid } from "./MetricsGrid";
import { TransactionsCard } from "./TransactionsCard";
import { InsightsCard } from "./InsightsCard";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";

export const DashboardContent = () => {
  const { metrics, loading } = useOpenFinanceDashboard();
  
  // Usar métricas do Open Finance se disponíveis, caso contrário fallback para métricas estáticas
  const hasOpenFinanceData = metrics && metrics.integracoesAtivas > 0;

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      {/* Mostrar métricas do Open Finance se disponíveis */}
      {hasOpenFinanceData ? (
        <OpenFinanceMetricsGrid />
      ) : (
        <MetricsGrid />
      )}
      
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <TransactionsCard />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <InsightsCard />
        </div>
      </div>
    </div>
  );
};
