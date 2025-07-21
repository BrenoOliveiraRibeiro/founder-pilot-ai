
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FinanceHeader } from "@/components/finances/FinanceHeader";
import { RunwayAlert } from "@/components/shared/RunwayAlert";
import { SeparatedFinanceMetricsGrid } from "@/components/finances/SeparatedFinanceMetricsGrid";
import { CreditMetricsGrid } from "@/components/finances/CreditMetricsGrid";
import { FinanceOverviewTab } from "@/components/finances/tabs/FinanceOverviewTab";
import { CashFlowTab } from "@/components/finances/tabs/CashFlowTab";
import { ExpensesTab } from "@/components/finances/tabs/ExpensesTab";
import { AccountsTab } from "@/components/finances/tabs/AccountsTab";
import { useAuth } from "@/contexts/AuthContext";
import { useSeparatedFinanceData } from "@/hooks/useSeparatedFinanceData";

const FinancesPage = () => {
  const { currentEmpresa } = useAuth();
  const { metrics: separatedMetrics, loading } = useSeparatedFinanceData();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const runwayMonths = separatedMetrics?.runwayMonths || 0;
  const hasRealData = separatedMetrics && separatedMetrics.integracoesAtivas > 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados financeiros...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <FinanceHeader selectedDate={selectedDate} onDateChange={setSelectedDate} />
      <RunwayAlert runwayMonths={runwayMonths} hasRealData={hasRealData} className="mb-6" />
      
      {separatedMetrics && (
        <>
          <SeparatedFinanceMetricsGrid metrics={separatedMetrics} />
          <CreditMetricsGrid 
            creditMetrics={separatedMetrics.creditMetrics} 
            isCriticalUsage={separatedMetrics.isCriticalCreditUsage} 
          />
        </>
      )}

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
