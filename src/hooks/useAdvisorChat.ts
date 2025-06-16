
import { useState, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/components/advisor/ChatMessage";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";

// Sugestões mais concisas e estratégicas para startups (otimizadas para mobile)
const initialSuggestions = [
  "Analisar meu runway atual",
  "Otimizar burn rate",
  "Quando captar recursos",
  "Reduzir despesas críticas",
  "Aumentar receita rapidamente",
  "Projeções dos próximos 6 meses"
];

export const useAdvisorChat = (userData: { empresaId?: string | null; empresaNome?: string | null; userNome?: string | null }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<boolean>(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Integrar dados financeiros reais
  const { metrics, loading: metricsLoading } = useOpenFinanceDashboard();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Buscar transações recentes para contexto adicional
  const getRecentTransactions = async () => {
    if (!userData.empresaId) return [];
    
    try {
      const { data: transacoes, error } = await supabase
        .from('transacoes')
        .select('*')
        .eq('empresa_id', userData.empresaId)
        .order('data_transacao', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return transacoes || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  };

  // Preparar contexto financeiro estruturado
  const prepareFinancialContext = async () => {
    const recentTransactions = await getRecentTransactions();
    
    // Análise de categorias de despesas
    const despesas = recentTransactions.filter(t => t.tipo === 'despesa');
    const receitas = recentTransactions.filter(t => t.tipo === 'receita');
    
    const despesasPorCategoria = despesas.reduce((acc, tx) => {
      acc[tx.categoria] = (acc[tx.categoria] || 0) + Math.abs(tx.valor);
      return acc;
    }, {} as Record<string, number>);

    const receitasPorMes = receitas.reduce((acc, tx) => {
      const mes = new Date(tx.data_transacao).toISOString().slice(0, 7);
      acc[mes] = (acc[mes] || 0) + tx.valor;
      return acc;
    }, {} as Record<string, number>);

    return {
      metrics: metrics || null,
      transacoes: {
        total: recentTransactions.length,
        recentes: recentTransactions.slice(0, 5),
        despesasPorCategoria,
        receitasPorMes,
        totalReceitas: receitas.reduce((sum, tx) => sum + tx.valor, 0),
        totalDespesas: Math.abs(despesas.reduce((sum, tx) => sum + tx.valor, 0))
      },
      alertas: {
        runwayCritico: metrics && metrics.runwayMeses < 3,
        burnRateAlto: metrics && metrics.burnRate > (metrics.receitaMensal * 1.2),
        crescimentoReceita: false // Calcular baseado em tendências
      }
    };
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
      // Preparar contexto financeiro completo
      const financialContext = await prepareFinancialContext();
      
      // Preparar dados estruturados para a IA
      const contextData = {
        userData: {
          empresaId: userData.empresaId || null,
          empresaNome: userData.empresaNome || null,
          userNome: userData.userNome || null
        },
        financialData: financialContext,
        hasRealData: metrics && metrics.integracoesAtivas > 0,
        timestamp: new Date().toISOString()
      };

      console.log('Enviando contexto financeiro para IA:', contextData);

      // Chamar Edge Function com contexto financeiro completo
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: userMessage.content,
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

      setMessages(prev => [...prev, aiResponse]);
      
      toast({
        title: "Análise baseada em dados reais",
        description: metrics && metrics.integracoesAtivas > 0 
          ? "Insights gerados com base nos seus dados financeiros conectados"
          : "Recomendações baseadas no perfil da sua empresa",
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
    isLoading: isLoading || metricsLoading,
    isError,
    conversationHistory,
    suggestions: initialSuggestions,
    messagesEndRef,
    handleSendMessage,
    handleInputChange,
    handleSuggestionClick,
    scrollToBottom,
    hasFinancialData: metrics && metrics.integracoesAtivas > 0,
    financialMetrics: metrics
  };
};
