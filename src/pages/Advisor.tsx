
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, SendIcon, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Sample suggestions and responses
const suggestions = [
  "Como posso estender meu runway?",
  "Devo priorizar crescimento ou lucratividade?",
  "Quando devo começar meu processo de captação?",
  "Como meu burn rate se compara a outras startups?",
];

const sampleResponses = [
  "Com base em seus dados financeiros, recomendo focar em estender seu runway. Seu burn rate atual de R$ 12.733 por semana oferece aproximadamente 3,5 meses de runway. Para estender isso, considere:\n\n1. **Revisar Assinaturas SaaS**: Seus custos de software aumentaram 28% no último trimestre.\n\n2. **Otimizar Estrutura de Equipe**: Suas despesas de engenharia são maiores que startups similares no seu estágio.\n\n3. **Priorizar Atividades Geradoras de Receita**: Foque em canais de aquisição de clientes com o maior ROI.\n\nImplementar essas mudanças poderia estender seu runway por 2-3 meses adicionais, o que seria crucial para seu próximo ciclo de captação.",
  
  "No seu estágio atual com R$ 45.800 em receita mensal e taxa de crescimento de 12,5%, recomendo uma abordagem equilibrada que favoreça ligeiramente o crescimento. Aqui está o porquê:\n\n1. **Timing de Mercado**: Sua indústria tipicamente vê avaliações mais altas para empresas crescendo a 15%+ MoM.\n\n2. **Análise de Concorrentes**: Seus concorrentes diretos estão crescendo a uma média de 18% MoM.\n\n3. **Economia da Unidade**: Seu CAC:LTV é saudável em 1:4, indicando espaço para aquisição mais agressiva.\n\nConsidere aumentar seu gasto de marketing em 20% enquanto mantém controle rigoroso sobre despesas não relacionadas ao crescimento. Isso deve ajudar a atingir uma taxa de crescimento ideal sem reduzir significativamente seu runway.",
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
  const { toast } = useToast();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: randomResponse,
        sender: "ai",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
      
      toast({
        title: "Análise concluída",
        description: "Seus dados foram analisados pela IA",
        duration: 3000,
      });
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mr-5">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight">Co-Founder IA</h1>
            <p className="text-muted-foreground mt-1">
              Seu assistente estratégico com acesso aos seus dados e análises
            </p>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden border border-border/40 shadow-md">
          <CardContent className="p-0">
            <div className="min-h-[70vh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Brain className="h-8 w-8 text-primary/80" />
                    </div>
                    <h2 className="text-2xl font-medium mb-3">Como posso ajudar hoje?</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                      Sou seu co-founder AI, especializado em estratégia de startup, análise financeira, 
                      e suporte à decisão. Tenho acesso aos seus dados financeiros e insights de mercado.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-between rounded-xl py-3 h-auto border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
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
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border/40"
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
                    <div className="bg-card rounded-2xl p-4 max-w-[80%] border border-border/40 shadow-sm">
                      <div className="flex gap-2 items-center">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                        </div>
                        <span className="text-sm">Analisando seus dados...</span>
                      </div>
                    </div>
                  </div>
                )}
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
                    className="rounded-xl px-5"
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
