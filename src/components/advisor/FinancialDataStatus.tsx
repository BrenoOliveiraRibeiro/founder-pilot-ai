
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FinancialDataStatusProps {
  hasFinancialData: boolean;
}

export const FinancialDataStatus: React.FC<FinancialDataStatusProps> = ({
  hasFinancialData
}) => {
  if (hasFinancialData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <span className="font-medium">Conecte suas contas bancárias</span> para receber insights baseados em dados reais. 
          Atualmente usando dados demonstrativos para análises gerais.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};
