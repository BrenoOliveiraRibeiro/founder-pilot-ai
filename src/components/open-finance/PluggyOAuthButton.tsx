
import React from "react";
import { Button } from "@/components/ui/button";
import { usePluggyOAuth } from "@/hooks/usePluggyOAuth";
import { Loader2, Link2, AlertCircle } from "lucide-react";

interface PluggyOAuthButtonProps {
  useSandbox?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const PluggyOAuthButton: React.FC<PluggyOAuthButtonProps> = ({
  className = "",
  variant = "outline"
}) => {
  // Sempre produção, ignorar prop useSandbox
  const { startPluggyAuth, isLoading, authResult, debugInfo } = usePluggyOAuth();

  const handleConnect = () => {
    startPluggyAuth();
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleConnect}
        disabled={isLoading || (authResult?.success === true)}
        className={`${className} relative overflow-hidden transition-all duration-300 group`}
        variant={variant}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : authResult?.success ? (
          <>
            <span className="flex items-center">
              Conta conectada com sucesso!
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center">
              Conectar via OAuth
              <Link2 className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </>
        )}
      </Button>

      {authResult && !authResult.success && (
        <div className="text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Erro na conexão: {authResult.message}
        </div>
      )}

      {debugInfo && (
        <details className="text-xs border border-destructive/30 rounded p-2 mt-2">
          <summary className="cursor-pointer font-medium text-destructive">Informações de debug</summary>
          <pre className="mt-2 p-2 bg-destructive/5 rounded overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
