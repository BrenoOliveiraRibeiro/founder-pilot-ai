
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceHeader } from "@/components/finances/FinanceHeader";
import { RunwayAlert } from "@/components/finances/RunwayAlert";
import { FinanceMetricsGrid } from "@/components/finances/FinanceMetricsGrid";
import { FinanceOverviewTab } from "@/components/finances/tabs/FinanceOverviewTab";
import { CashFlowTab } from "@/components/finances/tabs/CashFlowTab";
import { ExpensesTab } from "@/components/finances/tabs/ExpensesTab";
import { AccountsTab } from "@/components/finances/tabs/AccountsTab";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";

const FinancesPage = () => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);

  // Usar métricas mais recentes ou valor padrão
  const latestMetrics = metrics[0];
  const runway = latestMetrics?.runway_meses || 4.2;

  return (
    <AppLayout>
      <FinanceHeader />
      <RunwayAlert runway={runway} />
      <FinanceMetricsGrid />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FinanceOverviewTab runway={runway} />
        </TabsContent>

        <TabsContent value="cashflow">
          <CashFlowTab />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpensesTab />
        </TabsContent>

        <TabsContent value="accounts">
          <AccountsTab />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default FinancesPage;
