
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceHeader } from "@/components/finances/FinanceHeader";
import { RunwayAlert } from "@/components/finances/RunwayAlert";
import { FinanceMetricsGrid } from "@/components/finances/FinanceMetricsGrid";
import { FinanceOverviewTab } from "@/components/finances/tabs/FinanceOverviewTab";
import { CashFlowTab } from "@/components/finances/tabs/CashFlowTab";
import { ExpensesTab } from "@/components/finances/tabs/ExpensesTab";
import { AccountsTab } from "@/components/finances/tabs/AccountsTab";

const FinancesPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  return (
    <AppLayout>
      <FinanceHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <RunwayAlert />
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
