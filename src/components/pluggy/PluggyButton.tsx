
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { usePluggyConnect } from "@/hooks/usePluggyConnect";
import { toast } from "@/hooks/use-toast";

interface PluggyButtonProps {
  onSuccess: (item: any) => void;
  isLoading?: boolean;
}

export const PluggyButton: React.FC<PluggyButtonProps> = ({ onSuccess, isLoading = false }) => {
  const [connecting, setConnecting] = useState(false);
  const { pluggyWidgetLoaded, initializePluggyConnect } = usePluggyConnect();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleConnect = async () => {
    if (!pluggyWidgetLoaded) {
      toast({
        title: "Erro",
        description: "Widget do Pluggy ainda não foi carregado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);

    try {
      // Generate a connect token (in a real app, this would come from your backend)
      const connectToken = "test-connect-token";

      const pluggyConnect = await initializePluggyConnect(
        connectToken,
        {
          onSuccess: (item: any) => {
            console.log("Conexão bem-sucedida:", item);
            onSuccess(item);
            setConnecting(false);
          },
          onError: (error: any) => {
            console.error("Erro na conexão:", error);
            toast({
              title: "Erro",
              description: "Falha ao conectar com o banco. Tente novamente.",
              variant: "destructive",
            });
            setConnecting(false);
          },
          onExit: () => {
            console.log("Usuário fechou o widget");
            setConnecting(false);
          }
        },
        containerRef.current
      );

      if (!pluggyConnect) {
        throw new Error("Falha ao inicializar o widget");
      }

    } catch (error) {
      console.error("Erro ao inicializar Pluggy Connect:", error);
      toast({
        title: "Erro",
        description: "Falha ao inicializar a conexão bancária.",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleConnect}
        disabled={!pluggyWidgetLoaded || connecting || isLoading}
        className="w-full"
      >
        {connecting || isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <PlusCircle className="mr-2 h-4 w-4" />
            Conectar Conta Bancária
          </>
        )}
      </Button>
      <div ref={containerRef} className="mt-4" />
    </div>
  );
};
