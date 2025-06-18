
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const syncMarketDataService = async (empresaId: string, toast: any): Promise<void> => {
  // Buscar dados da empresa
  const { data: empresaData, error: empresaError } = await supabase
    .from("empresas")
    .select("*")
    .eq("id", empresaId)
    .single();
    
  if (empresaError) throw empresaError;
  
  // Chamar a função de dados de mercado
  const { error } = await supabase.functions.invoke("market-data", {
    body: {
      action: "fetch_benchmarks",
      empresa_id: empresaId,
      setor: empresaData.segmento,
      estagio: empresaData.estagio
    }
  });
  
  if (error) throw error;
  
  toast({
    title: "Dados de mercado atualizados",
    description: "Insights e benchmarks foram atualizados com sucesso.",
  });
};
