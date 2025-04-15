
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePluggyOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const navigate = useNavigate();

  // Check for auth code in URL when component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const error = urlParams.get('error');

    if (authCode) {
      exchangeCodeForToken(authCode);
    } else if (error) {
      toast({
        title: "Falha na autenticação",
        description: `O banco retornou um erro: ${error}`,
        variant: "destructive"
      });
    }
  }, []);

  const startPluggyAuth = async (sandbox = true) => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Você precisa ter uma empresa cadastrada para conectar sua conta bancária.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get authorization URL from Supabase Function
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          sandbox: sandbox
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || !data.authUrl) {
        throw new Error("Não foi possível obter a URL de autorização");
      }

      // Redirect to Pluggy authorization page
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Erro ao iniciar autenticação:", error);
      toast({
        title: "Erro ao conectar com Pluggy",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const exchangeCodeForToken = async (authCode: string) => {
    if (!currentEmpresa?.id) {
      toast({
        title: "Erro",
        description: "Você precisa ter uma empresa cadastrada para conectar sua conta bancária.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Exchange code for token via Supabase Function
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          code: authCode,
          empresa_id: currentEmpresa.id,
          redirectUri: window.location.origin
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Conta conectada com sucesso!",
        description: "Seus dados financeiros estão sendo sincronizados.",
      });

      setAuthResult({
        success: true,
        message: "Conexão estabelecida com sucesso!"
      });

      // Redirect to dashboard or finance page
      setTimeout(() => {
        navigate("/open-finance");
      }, 1500);
    } catch (error) {
      console.error("Erro ao trocar código por token:", error);
      setAuthResult({
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido"
      });
      toast({
        title: "Erro na conexão",
        description: "Ocorreu um erro ao conectar sua conta bancária. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      // Remove code from URL to prevent reprocessing
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return {
    isLoading,
    authResult,
    startPluggyAuth,
    exchangeCodeForToken
  };
};
