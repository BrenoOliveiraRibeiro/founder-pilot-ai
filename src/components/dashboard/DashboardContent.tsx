
import React from "react";
import { motion } from "framer-motion";
import { DashboardHeader } from "./DashboardHeader";
import { OpenFinanceMetricsGrid } from "./OpenFinanceMetricsGrid";
import { RunwayChart } from "./RunwayChart";
import { InsightsCard } from "./InsightsCard";
import { TransactionsCard } from "./TransactionsCard";
import { AIAdvisorCard } from "./AIAdvisorCard";

export const DashboardContent = () => {
  // Animation variants
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
        <OpenFinanceMetricsGrid />
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
    </motion.div>
  );
};
