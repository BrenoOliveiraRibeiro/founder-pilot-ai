
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface RunwayAlertProps {
  runway: number;
  loading?: boolean;
}

export const RunwayAlert: React.FC<RunwayAlertProps> = ({ runway, loading }) => {
  if (loading || runway >= 6) return null;
  
  const isVeryLow = runway < 3;
  const variant = isVeryLow ? "destructive" : "warning";
  
  return (
    <Alert variant={variant} className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>
        {isVeryLow ? "Alerta Crítico! Runway muito baixo" : "Atenção! Runway abaixo do recomendado"}
      </AlertTitle>
      <AlertDescription>
        Seu runway atual é de {runway.toFixed(1)} meses. 
        {isVeryLow 
          ? " Situação crítica! Tome ações imediatas para reduzir despesas ou buscar captação."
          : " Recomendamos ter pelo menos 6 meses de runway para segurança."
        }
      </AlertDescription>
    </Alert>
  );
};
