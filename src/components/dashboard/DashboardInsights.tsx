
import React from "react";
import { motion } from "framer-motion";
import { InsightsCard } from "./InsightsCard";
import { TransactionsCard } from "./TransactionsCard";

interface DashboardInsightsProps {
  itemVariants: any;
}

export const DashboardInsights: React.FC<DashboardInsightsProps> = ({ itemVariants }) => {
  return (
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
  );
};
