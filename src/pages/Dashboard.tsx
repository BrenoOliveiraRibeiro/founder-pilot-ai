
import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { useDashboardEffects } from "@/hooks/useDashboardEffects";

const Dashboard = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Custom hook for all dashboard effects (toasts, alerts, etc.)
  useDashboardEffects();
  
  useEffect(() => {
    // Simular um tempo de carregamento para a animação
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isPageLoading) {
    return (
      <AppLayout>
        <DashboardLoading />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DashboardContent />
    </AppLayout>
  );
};

export default Dashboard;
