
import React, { useEffect, useState, lazy, Suspense } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { DashboardStatusBar } from "@/components/dashboard/DashboardStatusBar";
import { useDashboardEffects } from "@/hooks/useDashboardEffects";

const DashboardContentOptimized = lazy(() => 
  import("@/components/dashboard/DashboardContentOptimized").then(module => ({ 
    default: module.DashboardContentOptimized 
  }))
);

const DashboardOptimized = () => {
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  useDashboardEffects();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1500); // Reduzido de 2000ms para 1500ms
    
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
      <Suspense fallback={<DashboardLoading />}>
        <DashboardContentOptimized />
      </Suspense>
      <DashboardStatusBar />
    </AppLayout>
  );
};

export default DashboardOptimized;
