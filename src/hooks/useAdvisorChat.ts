
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/advisor/ChatMessage";

// Sugestões mais estratégicas e modernas para startups
const initialSuggestions = [
  "Como otimizar meu runway com base nos dados financeiros atuais?",
  "Quais KPIs devo monitorar no meu estágio atual de crescimento?",
  "Qual o melhor timing para iniciar minha próxima rodada?",
  "Como reduzir meu CAC mantendo a qualidade de aquisição?",
  "Qual a melhor estrutura de equity para minha próxima contratação C-level?",
  "Como estruturar meu pitch deck para investidores de venture capital?"
];

export const useAdvisorChat = (userData: { empresaId?: string | null; empresaNome?: string | null; userNome?: string | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<boolean>(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

      // Call Edge Function with user message and context
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: userMessage.content,
          userData: contextData.userData
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
