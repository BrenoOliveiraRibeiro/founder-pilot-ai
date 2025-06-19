
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface RunwayAlertProps {
  runwayMonths: number;
  className?: string;
  hasRealData?: boolean;
}

export const RunwayAlert: React.FC<RunwayAlertProps> = ({ 
  runwayMonths, 
  className = "",
  hasRealData = false 
}) => {
  // Só mostrar o alerta se o runway for menor que 6 meses
  if (runwayMonths >= 6) return null;
  
  const isRunwayCritical = runwayMonths < 3;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          Alerta de Runway Crítico!
        </AlertTitle>
        <AlertDescription>
          Seu runway atual é de apenas {runwayMonths.toFixed(1)} meses
          {hasRealData ? " baseado nos dados conectados" : ""}. 
          Recomendamos tomar ações imediatas para reduzir despesas ou buscar captação de recursos.
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};
