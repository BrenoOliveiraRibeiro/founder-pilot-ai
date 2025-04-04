
import React from "react";
import { ShieldAlert } from "lucide-react";

interface ErrorMessageProps {
  isError: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ isError }) => {
  if (!isError) return null;
  
  return (
    <div className="flex justify-center animate-fade-in my-4">
      <div className="flex items-center gap-2 text-warning py-2 px-3 bg-warning/10 rounded-lg border border-warning/20">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-sm">Ocorreu um erro ao processar sua consulta. Tente novamente.</span>
      </div>
    </div>
  );
};
