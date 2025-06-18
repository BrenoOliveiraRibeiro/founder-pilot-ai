
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";

export const DashboardStatusBar = () => {
  const { currentEmpresa } = useAuth();
  const { metrics } = useOpenFinanceDashboard();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex justify-center"
    >
      <div className="bg-gradient-to-r from-primary/80 to-primary/90 text-white px-4 py-2 rounded-full shadow-premium text-sm flex items-center gap-2 hover:shadow-premium-hover transition-all duration-300 cursor-pointer">
        <span className="animate-pulse-subtle">●</span>
        Dashboard sincronizado
      </div>
    </motion.div>
  );
};
