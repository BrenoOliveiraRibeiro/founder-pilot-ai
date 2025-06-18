
import { supabase } from "@/integrations/supabase/client";
import { formatBelvoError } from "@/lib/utils";

export const testBelvoConnectionService = async (toast: any): Promise<any> => {
  console.log("Iniciando teste de conexão com Belvo...");
  const { data, error } = await supabase.functions.invoke("open-finance", {
    body: {
      action: "test_connection",
      sandbox: true
    }
  });
  
  if (error) {
    throw new Error(`Erro ao chamar função: ${error.message}`);
  }
  
  console.log("Resposta do teste:", data);
  
  if (data.success) {
    toast({
      title: "Conexão com Belvo estabelecida",
      description: `Teste bem-sucedido: ${data.accountsCount} contas de teste encontradas.`,
    });
  } else {
    const errorMessage = formatBelvoError(data);
    toast({
      title: "Falha na conexão com Belvo",
      description: errorMessage,
      variant: "destructive"
    });
    throw new Error(errorMessage);
  }
  
  return data;
};
