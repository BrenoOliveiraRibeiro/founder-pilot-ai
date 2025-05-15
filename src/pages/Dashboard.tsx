
import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { DashboardLoading } from "@/components/dashboard/DashboardLoading";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { DashboardStatusIndicator } from "@/components/dashboard/DashboardStatusIndicator";

const Dashboard = () => {
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const { isRunwayCritical, metrics } = useFinanceData(currentEmpresa?.id || null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  useEffect(() => {
    // Simular um tempo de carregamento para a animação
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Welcome toast na primeira visita
    const hasVisitedDashboard = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisitedDashboard) {
      setTimeout(() => {
        toast({
          title: "Bem-vindo ao FounderPilot AI",
          description: "Seu copiloto estratégico para tomada de decisões de negócios.",
          className: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
          duration: 5000,
        });
        localStorage.setItem('hasVisitedDashboard', 'true');
      }, 2500);
    }
    
    // Alerta de runway crítico
    if (isRunwayCritical) {
      setTimeout(() => {
        toast({
          title: "ALERTA: Runway Crítico",
          description: `Seu runway atual é de apenas ${metrics?.runway_meses?.toFixed(1)} meses. Acesse a seção de Finanças para mais detalhes.`,
          variant: "destructive",
          duration: 8000,
        });
      }, 3000);
    }
  }, [toast, isRunwayCritical, metrics?.runway_meses]);

  // Configuração das animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (isPageLoading) {
    return (
      <AppLayout>
        <DashboardLoading />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6 max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <DashboardHeader />
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6">
          <MetricsGrid />
        </motion.div>
        
        <DashboardCharts itemVariants={itemVariants} />
        
        <DashboardInsights itemVariants={itemVariants} />
        
        <DashboardStatusIndicator />
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
