
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook responsável por gerenciar o carregamento do script do Pluggy Connect
 * seguindo a documentação oficial
 */
export const usePluggyConnect = () => {
  const [pluggyWidgetLoaded, setPluggyWidgetLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const { toast } = useToast();

  const MAX_RETRIES = 2;
  const LOAD_TIMEOUT = 10000; // 10 segundos

  // URL oficial do script Pluggy conforme documentação
  const SCRIPT_URL = "https://cdn.pluggy.ai/pluggy-connect/v3.js";

  const checkPluggyAvailability = useCallback(() => {
    console.log("🔍 Verificando disponibilidade do PluggyConnect...");
    if (window.PluggyConnect && typeof window.PluggyConnect.init === 'function') {
      console.log("✅ PluggyConnect encontrado e pronto:", typeof window.PluggyConnect);
      setPluggyWidgetLoaded(true);
      setLoadError(null);
      setLoadingStatus('Widget carregado com sucesso');
      return true;
    }
    console.log("❌ PluggyConnect não disponível ou incompleto na window");
    return false;
  }, []);

  const removeExistingScript = useCallback(() => {
    const existingScript = document.getElementById("pluggy-script");
    if (existingScript) {
      console.log("🧹 Removendo script existente...");
      existingScript.remove();
    }
  }, []);

  const loadPluggyScript = useCallback(async () => {
    console.log(`📥 Carregando script oficial do Pluggy (tentativa ${retryCount + 1}/${MAX_RETRIES + 1}):`, SCRIPT_URL);
    setLoadingStatus(`Carregando widget oficial...`);

    return new Promise<boolean>((resolve) => {
      removeExistingScript();

      const script = document.createElement("script");
      script.id = "pluggy-script";
      script.src = SCRIPT_URL;
      script.async = true;
      script.crossOrigin = "anonymous";

      const timeout = setTimeout(() => {
        console.error(`⏰ Timeout ao carregar script: ${SCRIPT_URL}`);
        script.remove();
        resolve(false);
      }, LOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);
        console.log(`✅ Script carregado: ${SCRIPT_URL}`);
        
        // Aguardar um pouco para o objeto ficar disponível
        setTimeout(() => {
          if (checkPluggyAvailability()) {
            toast({
              description: "Widget Pluggy carregado com sucesso!",
            });
            resolve(true);
          } else {
            console.warn(`⚠️ Script carregado mas PluggyConnect não disponível: ${SCRIPT_URL}`);
            script.remove();
            resolve(false);
          }
        }, 1000);
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`❌ Erro ao carregar script: ${SCRIPT_URL}`, error);
        script.remove();
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }, [checkPluggyAvailability, removeExistingScript, retryCount, toast]);

  const attemptLoad = useCallback(async () => {
    if (loadingScript) return;
    
    setLoadingScript(true);
    setLoadError(null);

    // Verificar se já está disponível
    if (checkPluggyAvailability()) {
      setLoadingScript(false);
      return;
    }

    const success = await loadPluggyScript();
    
    if (success) {
      setLoadingScript(false);
      setRetryCount(0);
      return;
    }

    // Se falhou e ainda temos tentativas
    if (retryCount < MAX_RETRIES) {
      console.log(`🔄 Tentando novamente em 3 segundos... (${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount(prev => prev + 1);
      setLoadingStatus(`Tentativa ${retryCount + 2}/${MAX_RETRIES + 1} em 3s...`);
      
      setTimeout(() => {
        attemptLoad();
      }, 3000);
    } else {
      const error = `Falha ao carregar Pluggy Connect após ${MAX_RETRIES + 1} tentativas`;
      console.error("❌", error);
      setLoadError(error);
      setLoadingScript(false);
      setLoadingStatus('Erro: Widget não pôde ser carregado');
      
      toast({
        title: "Erro ao carregar Widget",
        description: "Não foi possível carregar o widget do Pluggy. Tente recarregar a página.",
        variant: "destructive",
        duration: 10000
      });
    }
  }, [loadingScript, checkPluggyAvailability, loadPluggyScript, retryCount, toast]);

  // Carregamento automático no mount
  useEffect(() => {
    attemptLoad();
  }, []);

  // Método para forçar recarregamento manual
  const forceReload = useCallback(() => {
    console.log("🔄 Forçando recarregamento do script Pluggy...");
    setRetryCount(0);
    setLoadError(null);
    setPluggyWidgetLoaded(false);
    attemptLoad();
  }, [attemptLoad]);

  // Implementação correta seguindo a documentação oficial
  const initializePluggyConnect = async (
    connectToken: string,
    options: any,
    containerElement: HTMLElement | null
  ) => {
    console.log("🚀 Inicializando Pluggy Connect (API oficial)", { 
      tokenLength: connectToken?.length || 0,
      tokenPreview: connectToken ? `${connectToken.substring(0, 10)}...` : 'Token não fornecido',
      options,
      containerExists: !!containerElement,
      pluggyAvailable: !!window.PluggyConnect
    });
    
    if (!connectToken) {
      const error = "Token de conexão não fornecido";
      console.error("❌", error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }
    
    if (!window.PluggyConnect) {
      const error = "Pluggy Connect não está disponível. Tentando recarregar...";
      console.error("❌", error);
      forceReload();
      toast({
        title: "Widget não carregado",
        description: "Tentando recarregar o widget automaticamente...",
        variant: "destructive"
      });
      return null;
    }
    
    if (!containerElement) {
      const error = "Container para o widget não encontrado";
      console.error("❌", error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log("🔧 Inicializando Pluggy Connect seguindo documentação oficial...");
      
      // Implementação correta seguindo a documentação
      const pluggyConnect = window.PluggyConnect.init({
        connectToken,
        includeSandbox: options.includeSandbox ?? false,
        onSuccess: options.onSuccess,
        onError: options.onError,
        onClose: options.onClose,
        connectorId: options.connectorId
      });

      console.log("✅ Instância do Pluggy Connect inicializada com sucesso");

      // Renderizar no container
      console.log("🎨 Montando widget no container...");
      pluggyConnect.render(containerElement);
      console.log("✅ Widget renderizado com sucesso");
      
      return pluggyConnect;
    } catch (error: any) {
      console.error("❌ Erro ao inicializar Pluggy Connect:", error);
      toast({
        title: "Falha na inicialização",
        description: error.message || "Erro ao inicializar o widget do Pluggy Connect",
        variant: "destructive"
      });
      return null;
    }
  };

  const isPluggyReady = () => {
    if (!pluggyWidgetLoaded) {
      if (loadError) {
        toast({
          title: "Pluggy Connect não está disponível",
          description: loadError,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Pluggy Connect não está pronto",
          description: "O widget ainda está sendo carregado, aguarde alguns instantes.",
          variant: "destructive"
        });
      }
      return false;
    }
    return true;
  };

  return {
    pluggyWidgetLoaded,
    loadError,
    loadingScript,
    retryCount,
    loadingStatus,
    initializePluggyConnect,
    isPluggyReady,
    forceReload
  };
};
