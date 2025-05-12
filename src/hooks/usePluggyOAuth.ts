
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOAuthAuthorize } from './open-finance/useOAuthAuthorize';
import { useOAuthCallback } from './open-finance/useOAuthCallback';

/**
 * Hook principal para gerenciar o fluxo OAuth do Pluggy
 */
export const usePluggyOAuth = () => {
  const { currentEmpresa } = useAuth();
  const { isLoading: authorizeLoading, startPluggyAuth } = useOAuthAuthorize();
  const { 
    isLoading: callbackLoading, 
    authResult, 
    debugInfo,
    processAuthorizationResponse
  } = useOAuthCallback();
  
  const isLoading = authorizeLoading || callbackLoading;

  // Verificar código de autenticação na URL quando o componente é montado
  useEffect(() => {
    const checkAuthCodeInUrl = async () => {
      await processAuthorizationResponse(currentEmpresa);
    };

    checkAuthCodeInUrl();
  }, [currentEmpresa]);

  /**
   * Inicia o processo de autenticação OAuth
   */
  const handleStartAuth = (sandbox = false) => {
    return startPluggyAuth(currentEmpresa, sandbox);
  };

  return {
    isLoading,
    authResult,
    debugInfo,
    startPluggyAuth: handleStartAuth
  };
};
