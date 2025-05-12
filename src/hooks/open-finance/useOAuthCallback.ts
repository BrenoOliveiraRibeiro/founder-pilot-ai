
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useOAuthValidator } from './useOAuthValidator';

/**
 * Hook para lidar com o processo de callback OAuth
 */
export const useOAuthCallback = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string } | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { validateCompanySelection, handleError } = useOAuthValidator();

  /**
   * Processa o código de autorização recebido no callback
   */
  const exchangeCodeForToken = async (authCode: string, currentEmpresa: any) => {
    if (!validateCompanySelection(currentEmpresa)) {
      return { success: false };
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
        const result = handleError(
          error, 
          "exchange_code", 
          "Não foi possível completar a autenticação com o banco",
          setDebugInfo
        );
        setAuthResult(result);
        return result;
      }

      if (!data || !data.success) {
        const result = handleError(
          new Error(data?.message || "Resposta inválida da API"), 
          "validate_token_response", 
          "Falha na troca do código de autorização",
          setDebugInfo
        );
        setAuthResult(result);
        return result;
      }

      console.log("Conexão OAuth estabelecida com sucesso:", {
        integration_id: data.integration_id
      });
      
      toast({
        title: "Conta conectada com sucesso!",
        description: "Seus dados financeiros estão sendo sincronizados.",
      });

      const successResult = {
        success: true,
        message: "Conexão estabelecida com sucesso!"
      };
      
      setAuthResult(successResult);

      // Redirecionar para a página de finanças/dashboard
      setTimeout(() => {
        navigate("/open-finance");
      }, 1500);
      
      return successResult;
      
    } catch (error) {
      const result = handleError(
        error, 
        "exchange_code_error", 
        "Ocorreu um erro ao processar a resposta do banco",
        setDebugInfo
      );
      setAuthResult(result);
      return result;
    } finally {
      setIsLoading(false);
      // Remover código da URL para evitar reprocessamento
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  };

  /**
   * Verifica se há código de autenticação ou erro na URL
   */
  const processAuthorizationResponse = (currentEmpresa: any) => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (authCode) {
      return exchangeCodeForToken(authCode, currentEmpresa);
    } else if (error) {
      console.error("Erro na autenticação OAuth:", error, errorDescription);
      const result = {
        success: false,
        message: errorDescription || `O banco retornou um erro: ${error}`
      };
      setAuthResult(result);
      
      toast({
        title: "Falha na autenticação",
        description: errorDescription || `O banco retornou um erro: ${error}`,
        variant: "destructive"
      });
      
      // Remove os parâmetros de erro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return result;
    }
    
    return null;
  };

  return {
    isLoading,
    authResult,
    debugInfo,
    exchangeCodeForToken,
    processAuthorizationResponse,
    setDebugInfo
  };
};
