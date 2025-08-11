
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

export const usePluggyWidget = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const pluggyConnectInstanceRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();

  useEffect(() => {
    console.log('🔄 [PLUGGY WIDGET] Verificando carregamento do script...');
    console.log('🔍 [PLUGGY WIDGET] window.PluggyConnect disponível:', !!window.PluggyConnect);
    console.log('🔍 [PLUGGY WIDGET] scriptLoadedRef.current:', scriptLoadedRef.current);
    
    if (window.PluggyConnect && !scriptLoadedRef.current) {
      console.log('✅ [PLUGGY WIDGET] Script já estava disponível');
      setIsScriptLoaded(true);
      scriptLoadedRef.current = true;
      return;
    }

    if (!scriptLoadedRef.current) {
      console.log('📥 [PLUGGY WIDGET] Carregando script da Pluggy...');
      const script = document.createElement('script');
      script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.8.2/pluggy-connect.js';
      script.async = true;
      
      script.onload = () => {
        console.log('✅ [PLUGGY WIDGET] Script carregado com sucesso');
        console.log('🔍 [PLUGGY WIDGET] window.PluggyConnect após load:', !!window.PluggyConnect);
        setIsScriptLoaded(true);
        scriptLoadedRef.current = true;
        
        toast({
          title: "Widget Carregado",
          description: "Widget da Pluggy está pronto para uso.",
          variant: "default",
        });
      };
      
      script.onerror = () => {
        console.error('❌ [PLUGGY WIDGET] Falha ao carregar script');
        setIsScriptLoaded(false);
        scriptLoadedRef.current = false;
        toast({
          title: "Erro",
          description: "Falha ao carregar o widget da Pluggy. Tente recarregar a página.",
          variant: "destructive",
        });
      };
      
      // Timeout para detectar script que não carrega
      setTimeout(() => {
        if (!scriptLoadedRef.current) {
          console.warn('⏰ [PLUGGY WIDGET] Timeout ao carregar script (10s)');
          toast({
            title: "Carregamento Lento",
            description: "O widget está demorando para carregar. Verifique sua conexão.",
            variant: "destructive",
          });
        }
      }, 10000);
      
      document.head.appendChild(script);

      return () => {
        console.log('🧹 [PLUGGY WIDGET] Limpando instância do widget...');
        if (pluggyConnectInstanceRef.current) {
          try {
            pluggyConnectInstanceRef.current.destroy?.();
            console.log('✅ [PLUGGY WIDGET] Instância destruída com sucesso');
          } catch (error) {
            console.log('⚠️ [PLUGGY WIDGET] Erro ao destruir instância:', error);
          }
          pluggyConnectInstanceRef.current = null;
        }
      };
    }
  }, [toast]);

  const initializePluggyConnect = async (
    onSuccess: (itemData: any) => Promise<void>,
    onError: (error: any) => void,
    options?: {
      updateItemId?: string;
      onEvent?: (event: any) => void;
    }
  ) => {
    console.log('🚀 [PLUGGY INIT] Iniciando inicialização do widget...');
    console.log('🔍 [PLUGGY INIT] Estado atual:', {
      isScriptLoaded,
      windowPluggyConnect: !!window.PluggyConnect,
      empresaId: currentEmpresa?.id,
      updateItemId: options?.updateItemId,
      isConnecting
    });

    // Validação de pré-requisitos
    if (!isScriptLoaded) {
      console.error('❌ [PLUGGY INIT] Script não carregado');
      toast({
        title: "Script não carregado",
        description: "O script da Pluggy ainda não foi carregado. Aguarde alguns segundos.",
        variant: "destructive",
      });
      return;
    }

    if (!window.PluggyConnect) {
      console.error('❌ [PLUGGY INIT] window.PluggyConnect não disponível');
      toast({
        title: "Widget indisponível",
        description: "O widget da Pluggy não está disponível. Tente recarregar a página.",
        variant: "destructive",
      });
      return;
    }

    if (!currentEmpresa?.id) {
      console.error('❌ [PLUGGY INIT] Empresa não encontrada');
      toast({
        title: "Erro de autenticação",
        description: "Empresa não encontrada. Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    if (isConnecting) {
      console.warn('⚠️ [PLUGGY INIT] Já existe uma conexão em andamento');
      toast({
        title: "Aguarde",
        description: "Uma conexão já está sendo processada. Aguarde a conclusão.",
        variant: "default",
      });
      return;
    }

    // Limpar instância anterior se existir
    if (pluggyConnectInstanceRef.current) {
      console.log('🧹 [PLUGGY INIT] Removendo instância anterior...');
      try {
        pluggyConnectInstanceRef.current.destroy?.();
        console.log('✅ [PLUGGY INIT] Instância anterior destruída');
      } catch (error) {
        console.warn('⚠️ [PLUGGY INIT] Erro ao destruir instância anterior:', error);
      }
      pluggyConnectInstanceRef.current = null;
    }

    setIsConnecting(true);
    const isUpdateMode = !!options?.updateItemId;
    console.log(`🔄 [PLUGGY INIT] Modo: ${isUpdateMode ? 'ATUALIZAÇÃO' : 'NOVA CONEXÃO'}`);
    
    if (isUpdateMode) {
      console.log('🔄 [PLUGGY INIT] Item a ser atualizado:', options?.updateItemId);
    }

    try {
      console.log('📡 [PLUGGY API] Preparando requisição para edge function...');
      
      // Preparar corpo da requisição
      const requestBody: any = {
        action: 'authorize',
        empresa_id: currentEmpresa.id,
        institution: 'pluggy',
        sandbox: true
      };

      // Se for modo update, incluir o item_id
      if (options?.updateItemId) {
        requestBody.update_item_id = options.updateItemId;
        console.log('📡 [PLUGGY API] Modo UPDATE - item_id:', options.updateItemId);
      } else {
        console.log('📡 [PLUGGY API] Modo CRIAÇÃO - nova conexão');
      }

      console.log('📡 [PLUGGY API] Body da requisição:', requestBody);

      // Exibir feedback visual
      toast({
        title: "Preparando conexão",
        description: "Obtendo token de autorização...",
        variant: "default",
      });

      console.log('📡 [PLUGGY API] Chamando edge function...');
      const { data, error } = await supabase.functions.invoke('open-finance', {
        body: requestBody
      });

      console.log('📡 [PLUGGY API] Resposta recebida:', { 
        hasData: !!data, 
        hasError: !!error,
        data: data ? JSON.stringify(data).substring(0, 200) : null,
        error: error ? JSON.stringify(error) : null
      });

      if (error) {
        console.error('❌ [PLUGGY API] Erro na edge function:', error);
        throw new Error(`Erro na comunicação: ${error.message || 'Erro desconhecido'}`);
      }

      if (data?.error) {
        console.error('❌ [PLUGGY API] Erro retornado pela API:', data.error);
        throw new Error(`Erro da API: ${data.error}`);
      }

      if (!data?.connect_token) {
        console.error('❌ [PLUGGY API] Connect token não recebido:', data);
        throw new Error('Token de conexão não foi gerado. Tente novamente.');
      }

      console.log('✅ [PLUGGY API] Connect token recebido com sucesso');
      console.log('🔧 [PLUGGY WIDGET] Configurando widget...');
      
      // Configuração do widget
      const widgetConfig: any = {
        connectToken: data.connect_token,
        includeSandbox: true,
        onSuccess: async (itemData: any) => {
          console.log(`✅ [PLUGGY WIDGET] ${isUpdateMode ? 'Atualização' : 'Conexão'} bem-sucedida!`);
          console.log('📊 [PLUGGY WIDGET] Dados do item:', {
            itemId: itemData.item?.id,
            status: itemData.item?.status,
            institution: itemData.item?.institution?.name
          });
          
          setIsConnecting(false);
          
          toast({
            title: "Sucesso!",
            description: `${isUpdateMode ? 'Conexão atualizada' : 'Conexão criada'} com sucesso.`,
            variant: "default",
          });
          
          // Chamar callback de sucesso
          await onSuccess(itemData);
        },
        onError: (error: any) => {
          console.error('❌ [PLUGGY WIDGET] Erro no widget:', error);
          setIsConnecting(false);
          
          toast({
            title: "Erro na conexão",
            description: error.message || "Ocorreu um erro durante a conexão. Tente novamente.",
            variant: "destructive",
          });
          
          onError(error);
        },
        onEvent: (event: any) => {
          console.log('📡 [PLUGGY WIDGET] Evento:', event.type, event);
          
          // Feedback para eventos importantes
          if (event.type === 'open') {
            toast({
              title: "Widget aberto",
              description: "Selecione sua instituição bancária.",
              variant: "default",
            });
          }
          
          options?.onEvent?.(event);
        },
        onClose: () => {
          console.log('🔒 [PLUGGY WIDGET] Widget fechado pelo usuário');
          setIsConnecting(false);
          
          toast({
            title: "Conexão cancelada",
            description: "O processo de conexão foi cancelado.",
            variant: "default",
          });
        }
      };

      // Se for modo update, definir updateItem
      if (options?.updateItemId) {
        widgetConfig.updateItem = options.updateItemId;
        console.log(`🔄 [PLUGGY WIDGET] Configurado para atualizar item: ${options.updateItemId}`);
      }

      console.log('🔧 [PLUGGY WIDGET] Configuração final:', {
        hasConnectToken: !!widgetConfig.connectToken,
        tokenLength: widgetConfig.connectToken?.length,
        includeSandbox: widgetConfig.includeSandbox,
        updateItem: widgetConfig.updateItem,
        mode: isUpdateMode ? 'UPDATE' : 'CREATE'
      });

      // Instanciar widget
      console.log('🏗️ [PLUGGY WIDGET] Instanciando PluggyConnect...');
      
      if (typeof window.PluggyConnect !== 'function') {
        throw new Error('PluggyConnect não é uma função válida');
      }
      
      pluggyConnectInstanceRef.current = new window.PluggyConnect(widgetConfig);
      console.log('✅ [PLUGGY WIDGET] Instância criada com sucesso');

      // Inicializar widget
      console.log('🚀 [PLUGGY WIDGET] Inicializando widget...');
      
      if (typeof pluggyConnectInstanceRef.current.init !== 'function') {
        throw new Error('Método init não está disponível na instância');
      }
      
      pluggyConnectInstanceRef.current.init();
      console.log('🎉 [PLUGGY WIDGET] Widget inicializado e deve estar visível!');
    } catch (error: any) {
      console.error('❌ [PLUGGY INIT] Erro crítico:', error);
      setIsConnecting(false);
      
      // Análise detalhada do erro
      let errorMessage = 'Erro desconhecido';
      let errorTitle = 'Erro na inicialização';
      
      if (error.message?.includes('Token')) {
        errorMessage = 'Falha ao obter token de autorização. Verifique sua conexão.';
        errorTitle = 'Erro de autorização';
      } else if (error.message?.includes('PluggyConnect')) {
        errorMessage = 'Widget não pôde ser carregado. Tente recarregar a página.';
        errorTitle = 'Erro do widget';
      } else if (error.message?.includes('edge function')) {
        errorMessage = 'Falha na comunicação com servidor. Tente novamente.';
        errorTitle = 'Erro de comunicação';
      } else {
        errorMessage = error.message || 'Ocorreu um erro inesperado. Tente novamente.';
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // Sugerir ações de recuperação
      setTimeout(() => {
        toast({
          title: "Sugestão",
          description: "Se o problema persistir, tente recarregar a página.",
          variant: "default",
        });
      }, 3000);
    }
  };

  return {
    isConnecting,
    isScriptLoaded,
    initializePluggyConnect
  };
};
