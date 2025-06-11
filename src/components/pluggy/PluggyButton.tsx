
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { usePluggyConnect } from "@/hooks/usePluggyConnect";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface PluggyButtonProps {
  onSuccess: (item: any) => void;
  isLoading?: boolean;
}

export const PluggyButton: React.FC<PluggyButtonProps> = ({ onSuccess, isLoading = false }) => {
  const [connecting, setConnecting] = useState(false);
  const { pluggyWidgetLoaded, initializePluggyConnect } = usePluggyConnect();
  const { currentEmpresa } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  const generateConnectToken = async () => {
    if (!currentEmpresa?.id) {
      throw new Error("Empresa não encontrada");
    }

    try {
      const { data, error } = await supabase.functions.invoke('open-finance', {
        body: {
          action: 'authorize',
          empresa_id: currentEmpresa.id,
          institution: 'pluggy',
          sandbox: true
        }
      });

      if (error) throw error;

      return data.connect_token;
    } catch (error) {
      console.error('Erro ao gerar connect token:', error);
      throw new Error('Falha ao gerar token de conexão');
    }
  };

  const handleConnect = async () => {
    if (!pluggyWidgetLoaded) {
      toast({
        title: "Erro",
        description: "Widget do Pluggy ainda não foi carregado. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Empresa não encontrada. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setConnecting(true);

    try {
      // Gerar connect token através da função edge
      const connectToken = await generateConnectToken();

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
        description: error instanceof Error ? error.message : "Falha ao inicializar a conexão bancária.",
        variant: "destructive",
      });
      setConnecting(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleConnect}
        disabled={!pluggyWidgetLoaded || connecting || isLoading || !currentEmpresa?.id}
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
