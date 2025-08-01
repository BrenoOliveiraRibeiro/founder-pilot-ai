
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceHeader } from "@/components/finances/FinanceHeader";
import { RunwayAlert } from "@/components/shared/RunwayAlert";
import { FinanceMetricsGrid } from "@/components/finances/FinanceMetricsGrid";
import { FinanceOverviewTab } from "@/components/finances/tabs/FinanceOverviewTab";
import { CashFlowTab } from "@/components/finances/tabs/CashFlowTab";
import { ExpensesTab } from "@/components/finances/tabs/ExpensesTab";
import { AccountsTab } from "@/components/finances/tabs/AccountsTab";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";

const FinancesPage = () => {
  const { currentEmpresa } = useAuth();
  const { metrics: openFinanceMetrics } = useOpenFinanceDashboard();
  const { saldoCaixa, saidasMesAtual } = useTransactionsMetrics();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Calcular runway usando os mesmos dados das outras páginas
  const hasOpenFinanceData = openFinanceMetrics && openFinanceMetrics.integracoesAtivas > 0;
  const hasTransactionData = saldoCaixa > 0 || saidasMesAtual > 0;

  let runwayMonths = 0;
  let hasRealData = false;

  if (hasOpenFinanceData) {
    runwayMonths = openFinanceMetrics.runwayMeses;
    hasRealData = true;
  } else if (hasTransactionData && saidasMesAtual > 0) {
    runwayMonths = saldoCaixa / saidasMesAtual;
    hasRealData = true;
  }

  return (
    <AppLayout>
      <FinanceHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <RunwayAlert runwayMonths={runwayMonths} hasRealData={hasRealData} className="mb-6" />
      <FinanceMetricsGrid selectedDate={selectedDate} />

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <FinanceOverviewTab selectedDate={selectedDate} />
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
