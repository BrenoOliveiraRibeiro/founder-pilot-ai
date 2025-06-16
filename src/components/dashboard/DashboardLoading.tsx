
import React from "react";
import { motion } from "framer-motion";

export const DashboardLoading = () => {
  return (
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
          Carregando dados financeiros reais...
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
  );
};
