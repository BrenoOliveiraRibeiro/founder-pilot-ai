
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RunwayChart } from "@/components/dashboard/RunwayChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import { AIAdvisorCard } from "@/components/dashboard/AIAdvisorCard";

const Dashboard = () => {
  return (
    <AppLayout>
      <DashboardHeader />
      <MetricsGrid />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RunwayChart />
        <AIAdvisorCard />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionsCard />
        <InsightsCard />
      </div>
    </AppLayout>
  );
};

export default Dashboard;
