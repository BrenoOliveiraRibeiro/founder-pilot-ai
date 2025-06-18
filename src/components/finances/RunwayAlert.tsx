
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface RunwayAlertProps {
  runway: number;
}

export const RunwayAlert: React.FC<RunwayAlertProps> = ({ runway }) => {
  if (runway >= 6) return null;
  
  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Atenção! Runway abaixo do recomendado</AlertTitle>
      <AlertDescription>
        Seu runway atual é de {runway.toFixed(1)} meses. Recomendamos ter pelo menos 6 meses de runway para segurança.
      </AlertDescription>
    </Alert>
  );
};
