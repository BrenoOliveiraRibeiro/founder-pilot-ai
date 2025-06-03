
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOAuthValidator } from './useOAuthValidator';

/**
 * Hook para lidar com o processo de autorização OAuth - apenas produção
 */
export const useOAuthAuthorize = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { validateCompanySelection, handleError } = useOAuthValidator();

  /**
   * Inicia o processo de autenticação OAuth com o Pluggy - sempre produção
   */
  const startPluggyAuth = async (currentEmpresa: any) => {
    if (!validateCompanySelection(currentEmpresa)) {
      return { success: false };
    }

    setIsLoading(true);
    try {
      console.log("Iniciando autenticação OAuth com Pluggy (Produção)", { 
        empresa_id: currentEmpresa.id
      });
      
      // Obter URL de autorização da função Supabase
      const { data, error } = await supabase.functions.invoke("open-finance", {
        body: {
          action: "authorize",
          empresa_id: currentEmpresa.id,
          sandbox: false, // Sempre produção
          redirectUri: `${window.location.origin}/open-finance` // Redirecionar para página Open Finance
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
