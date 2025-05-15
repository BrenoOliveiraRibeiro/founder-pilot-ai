
import React from "react";
import { motion } from "framer-motion";
import { RunwayChart } from "./RunwayChart";
import { AIAdvisorCard } from "./AIAdvisorCard";

interface DashboardChartsProps {
  itemVariants: any;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ itemVariants }) => {
  return (
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
  );
};
