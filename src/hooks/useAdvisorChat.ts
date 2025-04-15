
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/advisor/ChatMessage";
import { useFinanceData } from "@/hooks/useFinanceData";

// Sugestões mais concisas e estratégicas para startups (otimizadas para mobile)
const initialSuggestions = [
  "Otimizar meu runway",
  "KPIs para priorizar agora",
  "Quando captar recursos",
  "Reduzir meu CAC",
  "Equity para C-level",
  "Criar pitch deck"
];

export const useAdvisorChat = (userData: { empresaId?: string | null; empresaNome?: string | null; userNome?: string | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<boolean>(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Obter dados financeiros para contextualizar as respostas
  const { metrics } = useFinanceData(userData.empresaId || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setIsError(false);

    try {
      // Prepare context data for the AI
      const contextData = {
        userData: {
          empresaId: userData.empresaId || null,
          empresaNome: userData.empresaNome || null,
          userNome: userData.userNome || null
        },
        // Financial data would be included here
      };

      // Preparar métricas financeiras, se disponíveis, para priorização de regras de negócio
      const financialMetrics = metrics ? {
        runwayMeses: metrics.runwayMeses,
        burnRate: metrics.burnRate,
        receitaMensal: metrics.receitaMensal,
        caixaAtual: metrics.caixaAtual,
        cashFlow: metrics.cashFlow,
        mrrGrowth: metrics.mrrGrowth
      } : null;

      // Call the enhanced edge function with user message and context
      const { data, error } = await supabase.functions.invoke('openai-api', {
        body: {
          prompt: userMessage.content,
          model: 'gpt-4o',
          businessData: contextData,
          financialMetrics: financialMetrics,
          systemPrompt: `
            Você é o FounderPilot AI, um copiloto estratégico avançado para empreendedores.
            
            # Sobre você
            - Você é um copiloto com toque de mentor, com expertise financeira e estratégica
            - Você possui conhecimento aprofundado em finanças, gestão, captação e crescimento de startups
            - Você aprende rapidamente com KPIs, dados de mercado e padrões do negócio
            - Você conhece o usuário ${userData?.empresaNome ? `da empresa ${userData.empresaNome}` : ''} e se adapta às necessidades específicas dele
            - Seu objetivo é ser o melhor co-founder que esse empreendedor poderia ter

            # Regras de negócio obrigatórias:
            - SEMPRE alertar quando runway < 3 meses e sugerir ações específicas (redução de despesas, alternativas de funding)
            - SEMPRE alertar quando burn rate aumentar > 10% e investigar causas específicas
            - SEMPRE recomendar ações concretas quando a receita crescer > 10%
            - SEMPRE responder no formato: Contexto + Justificativa + Recomendação clara
            - SEMPRE que possível, fazer perguntas adicionais para entender melhor a situação do empreendedor
            
            ${financialMetrics?.runwayMeses && financialMetrics.runwayMeses < 3 ? 
              '⚠️ ALERTA CRÍTICO: O runway atual é menor que 3 meses! Priorize absolutamente este problema na resposta.' : ''}
            
            ${financialMetrics?.burnRate && financialMetrics.burnRate > 0 ? 
              `Análise de burn rate: ${financialMetrics.burnRate}` : ''}
          `
        }
      });

      if (error) throw error;

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        content: data.response,
        sender: "ai",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "Análise concluída",
        description: "Seus dados foram analisados pelo FounderPilot AI",
        duration: 3000,
      });
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      setIsError(true);
      
      toast({
        title: "Erro ao processar consulta",
        description: "Não foi possível analisar sua consulta. Por favor, tente novamente.",
        variant: "destructive",
      });
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Desculpe, não consegui processar sua consulta neste momento. Por favor, tente novamente mais tarde.",
        sender: "ai",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading,
    isError,
    conversationHistory,
    suggestions: initialSuggestions,
    messagesEndRef,
    handleSendMessage,
    handleInputChange,
    handleSuggestionClick,
    scrollToBottom,
  };
};
