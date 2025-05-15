import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RunwayChart } from "@/components/dashboard/RunwayChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import { AIAdvisorCard } from "@/components/dashboard/AIAdvisorCard";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";

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
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="h-14 w-14 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-lg font-medium text-primary"
            >
              Carregando dados financeiros...
            </motion.p>
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 300 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="h-1 bg-primary/20 rounded-full overflow-hidden"
            >
              <motion.div 
                initial={{ x: -300 }}
                animate={{ x: 300 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "linear"
                }}
                className="h-full w-1/3 bg-primary rounded-full"
              />
            </motion.div>
          </motion.div>
        </div>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-2"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full premium-card overflow-hidden"
            >
              <RunwayChart />
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="lg:col-span-1"
          >
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full premium-card overflow-hidden"
            >
              <AIAdvisorCard />
            </motion.div>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="h-full">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full premium-card overflow-hidden"
            >
              <InsightsCard />
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="h-full">
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="h-full premium-card overflow-hidden"
            >
              <TransactionsCard />
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex justify-center"
        >
          <div className="bg-gradient-to-r from-primary/80 to-primary/90 text-white px-4 py-2 rounded-full shadow-premium text-sm flex items-center gap-2 hover:shadow-premium-hover transition-all duration-300 cursor-pointer">
            <span className="animate-pulse-subtle">●</span>
            {currentEmpresa 
              ? `Analisando os dados financeiros de ${currentEmpresa.nome}...` 
              : "Conecte suas contas para mais insights"}
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
