
import { supabase } from '@/integrations/supabase/client';

interface ProviderInfo {
  id: string;
  name: string;
  logo: string;
  popular: boolean;
}

export const createBankIntegration = async (
  empresaId: string,
  itemId: string,
  selectedProvider: string,
  providers: ProviderInfo[],
  useSandbox: boolean
) => {
  const selectedProviderInfo = providers.find(p => p.id === selectedProvider);
  const providerName = selectedProviderInfo?.name || selectedProvider || 'Banco Conectado';
  
  const { data: integrationData, error: integrationError } = await supabase
    .from("integracoes_bancarias")
    .insert([
      {
        empresa_id: empresaId,
        nome_banco: providerName,
        tipo_conexao: "Open Finance",
        status: "ativo",
        ultimo_sincronismo: new Date().toISOString(),
        detalhes: { 
          item_id: itemId,
          provider_id: selectedProvider,
          sandbox: useSandbox,
          created_via: "pluggy_widget"
        }
      }
    ])
    .select()
    .single();

  if (integrationError) {
    console.error("Erro ao criar integração:", integrationError);
    throw new Error("Falha ao registrar a integração bancária");
  }

  console.log("Integração criada com sucesso:", integrationData);
  return integrationData;
};

export const executeCallback = async (
  empresaId: string,
  itemId: string,
  useSandbox: boolean
) => {
  const { data: callbackData, error: callbackError } = await supabase.functions.invoke("open-finance", {
    body: {
      action: "callback",
      empresa_id: empresaId,
      item_id: itemId,
      sandbox: useSandbox
    }
  });

  if (callbackError) {
    console.warn("Aviso no callback (não crítico):", callbackError);
  } else {
    console.log("Callback executado com sucesso:", callbackData);
  }

  return { callbackData, callbackError };
};

export const requestPluggyToken = async (
  empresaId: string,
  selectedProvider: string,
  useSandbox: boolean
) => {
  console.log("Solicitando token para Pluggy Connect:", {
    empresa_id: empresaId,
    institution: selectedProvider,
    sandbox: useSandbox
  });
  
  const { data, error } = await supabase.functions.invoke("open-finance", {
    body: {
      action: "authorize",
      empresa_id: empresaId,
      institution: selectedProvider,
      sandbox: useSandbox
    }
  });

  console.log("Resposta da API:", { data, error });

  if (error) {
    console.error("Erro na autorização:", error);
    throw error;
  }
  
  if (!data || !data.connect_token) {
    console.error("Token não retornado:", data);
    throw new Error("Token de conexão não retornado pelo servidor");
  }

  return data.connect_token;
};
