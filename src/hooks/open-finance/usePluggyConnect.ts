
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook responsável por gerenciar o carregamento do script do Pluggy Connect
 * com retry logic e melhor debugging
 */
export const usePluggyConnect = () => {
  const [pluggyWidgetLoaded, setPluggyWidgetLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingScript, setLoadingScript] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const { toast } = useToast();

  const MAX_RETRIES = 3;
  const LOAD_TIMEOUT = 15000; // 15 segundos

  // URLs do script Pluggy (fallbacks)
  const SCRIPT_URLS = [
    "https://cdn.pluggy.ai/pluggy-connect/v2.js",
    "https://cdn.pluggy.ai/pluggy-connect/latest.js",
    "https://cdn.pluggy.ai/pluggy-connect/v1.js"
  ];

  const checkPluggyAvailability = useCallback(() => {
    console.log("Verificando disponibilidade do PluggyConnect...");
    if (window.PluggyConnect) {
      console.log("✅ PluggyConnect encontrado:", typeof window.PluggyConnect);
      setPluggyWidgetLoaded(true);
      setLoadError(null);
      setLoadingStatus('Widget carregado com sucesso');
      return true;
    }
    console.log("❌ PluggyConnect não disponível na window");
    return false;
  }, []);

  const removeExistingScript = useCallback(() => {
    const existingScript = document.getElementById("pluggy-script");
    if (existingScript) {
      console.log("Removendo script existente...");
      existingScript.remove();
    }
  }, []);

  const loadPluggyScript = useCallback(async (urlIndex = 0) => {
    if (urlIndex >= SCRIPT_URLS.length) {
      const error = `Todas as URLs do script falharam após ${MAX_RETRIES} tentativas`;
      console.error(error);
      setLoadError(error);
      setLoadingScript(false);
      setLoadingStatus('Falha ao carregar - todas as URLs testadas');
      return false;
    }

    const scriptUrl = SCRIPT_URLS[urlIndex];
    console.log(`Tentando carregar script do Pluggy (tentativa ${retryCount + 1}/${MAX_RETRIES + 1}):`, scriptUrl);
    setLoadingStatus(`Carregando script... (${urlIndex + 1}/${SCRIPT_URLS.length})`);

    return new Promise<boolean>((resolve) => {
      // Remove script anterior se existir
      removeExistingScript();

      const script = document.createElement("script");
      script.id = "pluggy-script";
      script.src = scriptUrl;
      script.async = true;
      script.crossOrigin = "anonymous";

      // Timeout para o carregamento
      const timeout = setTimeout(() => {
        console.error(`Timeout ao carregar script: ${scriptUrl}`);
        script.remove();
        resolve(false);
      }, LOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);
        console.log(`Script carregado: ${scriptUrl}`);
        
        // Aguardar um pouco para o objeto ficar disponível
        setTimeout(() => {
          if (checkPluggyAvailability()) {
            toast({
              description: "Widget Pluggy carregado com sucesso!",
            });
            resolve(true);
          } else {
            console.warn(`Script carregado mas PluggyConnect não disponível: ${scriptUrl}`);
            script.remove();
            resolve(false);
          }
        }, 500);
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error(`Erro ao carregar script: ${scriptUrl}`, error);
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

    // Primeiro, verificar se já está disponível
    if (checkPluggyAvailability()) {
      setLoadingScript(false);
      return;
    }

    // Tentar carregar com cada URL
    for (let urlIndex = 0; urlIndex < SCRIPT_URLS.length; urlIndex++) {
      const success = await loadPluggyScript(urlIndex);
      if (success) {
        setLoadingScript(false);
        setRetryCount(0);
        return;
      }
    }

    // Se chegou aqui, todas as URLs falharam
    if (retryCount < MAX_RETRIES) {
      console.log(`Tentando novamente em 2 segundos... (${retryCount + 1}/${MAX_RETRIES})`);
      setRetryCount(prev => prev + 1);
      setLoadingStatus(`Tentativa ${retryCount + 2}/${MAX_RETRIES + 1} em 2s...`);
      
      setTimeout(() => {
        attemptLoad();
      }, 2000);
    } else {
      const error = `Falha ao carregar Pluggy Connect após ${MAX_RETRIES + 1} tentativas`;
      console.error(error);
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

  // Responsabilidade: Inicializar o widget do Pluggy Connect
  const initializePluggyConnect = async (
    connectToken: string,
    options: any,
    containerElement: HTMLElement | null
  ) => {
    console.log("🚀 Inicializando Pluggy Connect", { 
      tokenLength: connectToken?.length || 0,
      tokenPreview: connectToken ? `${connectToken.substring(0, 10)}...` : 'Token não fornecido',
      options,
      containerExists: !!containerElement,
      pluggyAvailable: !!window.PluggyConnect
    });
    
    // Validações
    if (!connectToken) {
      const error = "Token de conexão não fornecido";
      console.error(error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }
    
    if (!window.PluggyConnect) {
      const error = "Pluggy Connect não está disponível. Tentando recarregar...";
      console.error(error);
      
      // Tentar recarregar automaticamente
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
      console.error(error);
      toast({
        title: "Erro de inicialização",
        description: error,
        variant: "destructive"
      });
      return null;
    }

    try {
      console.log("Criando instância do Pluggy Connect...");
      const pluggyConnect = await window.PluggyConnect.create({
        connectToken,
        includeSandbox: options.includeSandbox ?? false, // Sempre produção por padrão
        ...options
      });

      console.log("✅ Instância do Pluggy Connect criada com sucesso");

      // Renderiza o widget
      console.log("Montando widget no container...");
      pluggyConnect.mount(containerElement);
      console.log("✅ Widget montado com sucesso");
      
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

  // Responsabilidade: Verificar se o Pluggy Connect está pronto para uso
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
