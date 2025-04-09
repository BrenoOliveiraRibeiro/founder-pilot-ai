
import React from "react";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-background border border-border rounded-md shadow-sm p-2 text-sm"
      >
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          Saldo: {formatCurrency(payload[0].value)}
        </p>
        {payload[0].payload.future && (
          <p className="text-xs text-muted-foreground mt-1">
            (Projeção)
          </p>
        )}
      </motion.div>
    );
  }

  return null;
};
