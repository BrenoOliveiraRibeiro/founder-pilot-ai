
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface RunwayAlertProps {
  runwayMonths: number;
  className?: string;
}

export const RunwayAlert: React.FC<RunwayAlertProps> = ({ runwayMonths, className = "" }) => {
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
      <Alert variant={isRunwayCritical ? "destructive" : "warning"}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          {isRunwayCritical ? "Alerta: Runway Crítico" : "Atenção: Runway abaixo do recomendado"}
        </AlertTitle>
        <AlertDescription>
          Seu runway atual é de {runwayMonths.toFixed(1)} meses. 
          {isRunwayCritical 
            ? " Considere reduzir despesas ou buscar financiamento adicional imediatamente para evitar problemas de fluxo de caixa."
            : " Recomendamos ter pelo menos 6 meses de runway para segurança financeira. Considere reduzir despesas ou buscar captação."
          }
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};
