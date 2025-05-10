
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const usePluggyOAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const navigate = useNavigate();

  // Verificar código de autenticação na URL quando o componente é montado
  useEffect(() => {
    const checkAuthCodeInUrl = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (authCode) {
        await exchangeCodeForToken(authCode);
      } else if (error) {
        console.error("Erro na autenticação OAuth:", error, errorDescription);
        setAuthResult({
          success: false,
          message: errorDescription || `O banco retornou um erro: ${error}`
        });
        toast({
          title: "Falha na autenticação",
          description: errorDescription || `O banco retornou um erro: ${error}`,
          variant: "destructive"
        });
        
        // Remove os parâmetros de erro da URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    checkAuthCodeInUrl();
  }, []);

  // Validar se a empresa está selecionada
  const validateCompanySelection = () => {
    if (!currentEmpresa?.id) {
      const message = "Você precisa ter uma empresa cadastrada para conectar sua conta bancária.";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  // Registrar erro e exibir notificação
  const handleError = (error: any, step: string, userMessage: string) => {
    console.error(`Erro em ${step}:`, error);
    setDebugInfo({ error, step });
    
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    
    setAuthResult({
      success: false,
      message: errorMessage
    });
    
    toast({
      title: "Erro",
      description: userMessage,
      variant: "destructive"
    });
    
    setIsLoading(false);
    return false;
  };

  const startPluggyAuth = async (sandbox = false) => {
    if (!validateCompanySelection()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Iniciando autenticação OAuth com Pluggy", { 
        empresa_id: currentEmpresa.id, 
        sandbox 
      });
      
      // Obter URL de autorização da função Supabase
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          sandbox: sandbox,
          redirectUri: window.location.origin // Garante redirecionamento para a origem atual
        }
      });

      if (error) {
        return handleError(
          error, 
          "authorize", 
          "Não foi possível obter a URL de autorização do Pluggy."
        );
      }

      if (!data || !data.authUrl) {
        return handleError(
          new Error("Resposta inválida da API"), 
          "validate_auth_url", 
          "Não foi possível obter a URL de autorização"
        );
      }

      // Redirecionar para a página de autorização do Pluggy
      console.log("Redirecionando para URL de autorização:", data.authUrl);
      window.location.href = data.authUrl;
      
    } catch (error) {
      return handleError(
        error, 
        "start_auth", 
        "Ocorreu um erro ao iniciar o processo de autenticação"
      );
    }
  };

  const exchangeCodeForToken = async (authCode: string) => {
    if (!validateCompanySelection()) {
      return;
    }

    setIsLoading(true);
    try {
      console.log("Trocando código de autorização por token", { 
        codeLength: authCode?.length || 0,
        empresa_id: currentEmpresa.id 
      });
      
      // Trocar código por token via Função Supabase
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "callback",
          code: authCode,
          empresa_id: currentEmpresa.id,
          redirectUri: window.location.origin
        }
      });

      if (error) {
        return handleError(
          error, 
          "exchange_code", 
          "Não foi possível completar a autenticação com o banco"
        );
      }

      if (!data || !data.success) {
        return handleError(
          new Error(data?.message || "Resposta inválida da API"), 
          "validate_token_response", 
          "Falha na troca do código de autorização"
        );
      }

      console.log("Conexão OAuth estabelecida com sucesso:", {
        integration_id: data.integration_id
      });
      
      toast({
        title: "Conta conectada com sucesso!",
        description: "Seus dados financeiros estão sendo sincronizados.",
      });

      setAuthResult({
        success: true,
        message: "Conexão estabelecida com sucesso!"
      });

      // Redirecionar para a página de finanças/dashboard
      setTimeout(() => {
        navigate("/open-finance");
      }, 1500);
      
    } catch (error) {
      return handleError(
        error, 
        "exchange_code_error", 
        "Ocorreu um erro ao processar a resposta do banco"
      );
    } finally {
      setIsLoading(false);
      // Remover código da URL para evitar reprocessamento
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  return {
    isLoading,
    authResult,
    debugInfo,
    startPluggyAuth,
    exchangeCodeForToken
  };
};
