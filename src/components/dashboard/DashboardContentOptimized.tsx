
import React, { memo } from "react";
import { DashboardHeader } from "./DashboardHeader";
import { OpenFinanceMetricsGrid } from "./OpenFinanceMetricsGrid";
import { MetricsGrid } from "./MetricsGrid";
import { RunwayChart } from "./RunwayChart";
import { TransactionsCard } from "./TransactionsCard";
import { InsightsCard } from "./InsightsCard";
import { AIAdvisorCard } from "./AIAdvisorCard";
import { useOpenFinanceDashboardOptimized } from "@/hooks/useOpenFinanceDashboardOptimized";

const MemoizedOpenFinanceMetricsGrid = memo(OpenFinanceMetricsGrid);
const MemoizedMetricsGrid = memo(MetricsGrid);
const MemoizedRunwayChart = memo(RunwayChart);
const MemoizedTransactionsCard = memo(TransactionsCard);
const MemoizedInsightsCard = memo(InsightsCard);
const MemoizedAIAdvisorCard = memo(AIAdvisorCard);

export const DashboardContentOptimized = memo(() => {
  const { metrics, loading, hasOpenFinanceData } = useOpenFinanceDashboardOptimized();
  
  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      {hasOpenFinanceData ? (
        <MemoizedOpenFinanceMetricsGrid />
      ) : (
        <MemoizedMetricsGrid />
      )}
      
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <MemoizedRunwayChart />
          <MemoizedTransactionsCard />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <MemoizedAIAdvisorCard />
          <MemoizedInsightsCard />
        </div>
      </div>
    </div>
  );
});

DashboardContentOptimized.displayName = "DashboardContentOptimized";
