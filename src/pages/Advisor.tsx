
import React, { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, ArrowRight, SendIcon, Sparkles, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Sample suggestions - mantemos as sugestões existentes
const suggestions = [
  "Como posso estender meu runway?",
  "Devo priorizar crescimento ou lucratividade?",
  "Quando devo começar meu processo de captação?",
  "Como meu burn rate se compara a outras startups?",
];

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const Advisor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll para o final das mensagens quando novas forem adicionadas
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      // Chamar nossa função edge do Supabase
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: {
          message: userMessage.content,
          userData: {
            empresaId: currentEmpresa?.id || null,
            empresaNome: currentEmpresa?.nome || null
          },
          // Poderíamos incluir dados financeiros reais aqui se disponíveis
          financialData: null
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
        description: "Seus dados foram analisados pela IA",
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
      
      // Adicionar mensagem de erro
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

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 flex items-center justify-center mr-5 shadow-sm">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight">FounderPilot AI</h1>
            <p className="text-muted-foreground mt-1">
              Seu assistente estratégico com acesso aos seus dados e análises
            </p>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden border-none shadow-md hover:shadow-lg dark:shadow-none dark:border dark:border-border/40 transition-all duration-300 bg-gradient-to-br from-white to-apple-silver/30 dark:from-apple-spacegray dark:to-apple-black/90 rounded-2xl">
          <CardContent className="p-0">
            <div className="min-h-[70vh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/80 to-primary/20 flex items-center justify-center shadow-sm animate-float">
                      <Sparkles className="h-10 w-10 text-primary/90" />
                    </div>
                    <h2 className="text-2xl font-medium mb-3">Como posso ajudar hoje?</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                      Sou seu FounderPilot AI, especializado em estratégia de startup, análise financeira, 
                      e suporte à decisão. Tenho acesso aos seus dados financeiros e insights de mercado.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-between rounded-xl py-3 h-auto border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 backdrop-blur-sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <span>{suggestion}</span>
                          <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 animate-fade-in shadow-sm ${
                          message.sender === "user"
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                            : "bg-gradient-to-br from-card to-apple-silver/20 dark:from-apple-spacegray/80 dark:to-apple-black/60 border border-border/40"
                        }`}
                      >
                        <div className="whitespace-pre-line text-[15px]">{message.content}</div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gradient-to-br from-card to-apple-silver/20 dark:from-apple-spacegray/80 dark:to-apple-black/60 rounded-2xl p-5 max-w-[80%] border border-border/40 shadow-sm">
                      <FriendlyLoadingMessage isLoading={isLoading} />
                    </div>
                  </div>
                )}
                
                {isError && (
                  <div className="flex justify-center animate-fade-in my-4">
                    <div className="flex items-center gap-2 text-warning py-2 px-3 bg-warning/10 rounded-lg border border-warning/20">
                      <ShieldAlert className="h-4 w-4" />
                      <span className="text-sm">Ocorreu um erro ao processar sua consulta. Tente novamente.</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-card/50 backdrop-blur-sm">
                <div className="flex gap-3">
                  <Input
                    placeholder="Pergunte sobre estratégia, finanças ou crescimento..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 rounded-xl border-primary/20 focus-visible:ring-primary/30 py-6 px-4 shadow-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="rounded-xl px-5 bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <SendIcon className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Advisor;
