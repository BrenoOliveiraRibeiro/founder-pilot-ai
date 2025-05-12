
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthValidator } from './useOAuthValidator';

/**
 * Hook para lidar com o processo de autorização OAuth
 */
export const useOAuthAuthorize = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { validateCompanySelection, handleError } = useOAuthValidator();

  /**
   * Inicia o processo de autenticação OAuth com o Pluggy
   */
  const startPluggyAuth = async (currentEmpresa: any, sandbox = false) => {
    if (!validateCompanySelection(currentEmpresa)) {
      return { success: false };
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
      return { success: true };
      
    } catch (error) {
      return handleError(
        error, 
        "start_auth", 
        "Ocorreu um erro ao iniciar o processo de autenticação"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    startPluggyAuth
  };
};
