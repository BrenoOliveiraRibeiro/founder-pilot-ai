
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/components/advisor/ChatMessage";
import { AdvisorChatUserData, FinancialContext } from "./types";

export const useAIMessageService = () => {
  const { toast } = useToast();

  const sendMessageToAI = async (
    message: string,
    userData: AdvisorChatUserData,
    financialContext: FinancialContext,
    hasFinancialData: boolean
  ): Promise<Message> => {
    const contextData = {
      userData: {
        empresaId: userData.empresaId || null,
        empresaNome: userData.empresaNome || null,
        userNome: userData.userNome || null
      },
      financialData: financialContext,
      hasRealData: hasFinancialData,
      timestamp: new Date().toISOString()
    };

    console.log('Enviando contexto financeiro para IA:', contextData);

    const { data, error } = await supabase.functions.invoke('ai-advisor', {
      body: {
        message: message,
        userData: contextData.userData,
        financialData: contextData.financialData,
        hasRealData: contextData.hasRealData
      }
    });

    if (error) throw error;

    const aiResponse: Message = {
      id: `ai-${Date.now()}`,
      content: data.response,
      sender: "ai",
      timestamp: new Date()
    };

    toast({
      title: "Análise baseada em dados reais",
      description: hasFinancialData 
        ? "Insights gerados com base nos seus dados financeiros conectados"
        : "Recomendações baseadas no perfil da sua empresa",
      duration: 3000,
    });

    return aiResponse;
  };

  const createErrorMessage = (): Message => {
    return {
      id: `error-${Date.now()}`,
      content: "Desculpe, não consegui processar sua consulta neste momento. Por favor, tente novamente mais tarde.",
      sender: "ai",
      timestamp: new Date()
    };
  };

  return {
    sendMessageToAI,
    createErrorMessage
  };
};
