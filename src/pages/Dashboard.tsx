
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsGrid } from "@/components/dashboard/MetricsGrid";
import { RunwayChart } from "@/components/dashboard/RunwayChart";
import { InsightsCard } from "@/components/dashboard/InsightsCard";
import { TransactionsCard } from "@/components/dashboard/TransactionsCard";
import { AIAdvisorCard } from "@/components/dashboard/AIAdvisorCard";
import { motion } from "framer-motion";

const Dashboard = () => {
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

  return (
    <AppLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <DashboardHeader />
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-6">
          <MetricsGrid />
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="h-full premium-card overflow-hidden"
          >
            <AIAdvisorCard />
          </motion.div>
          
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="h-full premium-card overflow-hidden"
          >
            <RunwayChart />
          </motion.div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="h-full premium-card overflow-hidden"
          >
            <InsightsCard />
          </motion.div>
          
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="h-full premium-card overflow-hidden"
          >
            <TransactionsCard />
          </motion.div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
