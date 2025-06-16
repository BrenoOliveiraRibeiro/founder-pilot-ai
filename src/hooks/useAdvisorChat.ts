
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/components/advisor/ChatMessage";
import { useFinancialContext } from "./advisor/useFinancialContext";
import { useAIMessageService } from "./advisor/useAIMessageService";
import { initialSuggestions } from "./advisor/suggestions";
import { AdvisorChatUserData, AdvisorChatReturn } from "./advisor/types";

export const useAdvisorChat = (userData: AdvisorChatUserData): AdvisorChatReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<boolean>(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    metrics,
    metricsLoading,
    prepareFinancialContext,
    hasFinancialData
  } = useFinancialContext(userData);

  const { sendMessageToAI, createErrorMessage } = useAIMessageService();

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
      const financialContext = await prepareFinancialContext();
      
      const aiResponse = await sendMessageToAI(
        userMessage.content,
        userData,
        financialContext,
        hasFinancialData
      );

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Erro ao processar consulta:", error);
      setIsError(true);
      
      toast({
        title: "Erro ao processar consulta",
        description: "Não foi possível analisar sua consulta. Por favor, tente novamente.",
        variant: "destructive",
      });
      
      const errorMessage = createErrorMessage();
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading: isLoading || metricsLoading,
    isError,
    conversationHistory,
    suggestions: initialSuggestions,
    messagesEndRef,
    handleSendMessage,
    handleInputChange,
    handleSuggestionClick,
    scrollToBottom,
    hasFinancialData,
    financialMetrics: metrics
  };
};
