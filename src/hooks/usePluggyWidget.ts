
import { useEffect } from 'react';
import { usePluggyScriptLoader } from './usePluggyScriptLoader';
import { usePluggyConnectManager } from './usePluggyConnectManager';

export const usePluggyWidget = () => {
  const { isScriptLoaded } = usePluggyScriptLoader();
  const { isConnecting, initializePluggyConnect, cleanup } = usePluggyConnectManager();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isConnecting,
    isScriptLoaded,
    initializePluggyConnect
  };
};
