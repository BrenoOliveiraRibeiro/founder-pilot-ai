
import React from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PluggyLoadingStatusProps {
  isLoaded: boolean;
  error?: string | null;
  isConnecting?: boolean;
}

export const PluggyLoadingStatus = ({ isLoaded, error, isConnecting }: PluggyLoadingStatusProps) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar o widget: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (isConnecting) {
    return (
      <Alert className="mb-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Conectando com o banco...
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoaded) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Widget carregado e pronto para uso
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      <AlertDescription>
        Carregando widget do Pluggy...
      </AlertDescription>
    </Alert>
  );
};
