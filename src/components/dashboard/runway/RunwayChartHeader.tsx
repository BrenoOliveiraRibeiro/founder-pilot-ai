
import React from "react";
import { CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface RunwayChartHeaderProps {
  isRunwayCritical: boolean;
  runwayMonths?: number | null;
}

export const RunwayChartHeader: React.FC<RunwayChartHeaderProps> = ({ 
  isRunwayCritical, 
  runwayMonths 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <CardTitle className="text-xl">Projeção de Runway</CardTitle>
        <CardDescription>
          Com base na sua taxa atual de queima de caixa
          {runwayMonths && (
            <span className="ml-2 font-medium">
              (Estimativa: {runwayMonths.toFixed(1)} meses)
            </span>
          )}
        </CardDescription>
      </div>
      
      {isRunwayCritical && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle size={14} />
            <span>Runway Crítico</span>
          </Badge>
        </motion.div>
      )}
    </div>
  );
};
