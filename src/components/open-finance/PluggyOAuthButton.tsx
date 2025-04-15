
import React from "react";
import { Button } from "@/components/ui/button";
import { usePluggyOAuth } from "@/hooks/usePluggyOAuth";
import { Loader2, Link2 } from "lucide-react";

interface PluggyOAuthButtonProps {
  useSandbox?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const PluggyOAuthButton: React.FC<PluggyOAuthButtonProps> = ({
  useSandbox = true,
  className = "",
  variant = "default"
}) => {
  const { startPluggyAuth, isLoading, authResult } = usePluggyOAuth();

  const handleConnect = () => {
    startPluggyAuth(useSandbox);
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
              Conectar com Open Finance
              <Link2 className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 bg-primary/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          </>
        )}
      </Button>

      {authResult && !authResult.success && (
        <div className="text-sm text-destructive">
          Erro na conexão: {authResult.message}
        </div>
      )}
    </div>
  );
};
