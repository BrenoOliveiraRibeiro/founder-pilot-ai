
import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const CriticalRunwayAlert: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md"
    >
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        <div>
          <h4 className="font-medium">Alerta: Runway Crítico</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Seu runway atual está abaixo de 3 meses. Considere reduzir despesas ou buscar financiamento
            adicional imediatamente para evitar problemas de fluxo de caixa.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default CriticalRunwayAlert;
