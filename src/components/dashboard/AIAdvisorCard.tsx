
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, SendIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// Exemplos de respostas da IA para simulação
const sampleResponses = [
  "Com base na sua taxa atual de queima, recomendo congelar novas contratações pelos próximos 60 dias para estender seu runway.",
  "Suas assinaturas de SaaS aumentaram 35% no último trimestre. Considere auditá-las para identificar potenciais economias.",
  "As projeções de fluxo de caixa sugerem que você deve iniciar uma captação nos próximos 45 dias para manter sua trajetória de crescimento.",
  "Seu custo de aquisição de cliente aumentou. Analisando seus canais de marketing, seu melhor ROI está vindo de vendas diretas, não de anúncios."
];

export const AIAdvisorCard = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentEmpresa } = useAuth();
  const navigate = useNavigate();

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Adicionar mensagem do usuário à conversa
    setConversation([...conversation, `Você: ${message}`]);
    setIsLoading(true);
    
    // Simular resposta da IA
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      setConversation([...conversation, `Você: ${message}`, `IA: ${randomResponse}`]);
      setIsLoading(false);
      setMessage("");
    }, 1000);
  };

  const handleGoToAdvisor = () => {
    navigate("/advisor");
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">IA Advisor</CardTitle>
          <CardDescription>Pergunte qualquer coisa sobre as finanças da sua startup</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 mb-4 overflow-y-auto space-y-3 max-h-56">
          {conversation.length === 0 ? (
            <div className="text-center text-muted-foreground my-8 px-4">
              <p className="mb-3">Precisa de conselhos estratégicos? Pergunte coisas como:</p>
              <ul className="text-sm space-y-2 text-left">
                <li>• "Como posso estender meu runway?"</li>
                <li>• "Qual o tamanho ideal de equipe neste estágio?"</li>
                <li>• "Quando devo começar a captar minha próxima rodada?"</li>
                <li>• "Como minhas métricas se comparam a startups similares?"</li>
              </ul>
            </div>
          ) : (
            conversation.map((msg, idx) => (
              <div 
                key={idx} 
                className={`text-sm p-2 rounded-md max-w-[85%] ${
                  msg.startsWith("Você:") 
                    ? "bg-muted ml-auto" 
                    : "bg-primary/10 mr-auto"
                }`}
              >
                {msg}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-primary/10 text-sm p-2 rounded-md max-w-[85%] mr-auto flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></div>
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
              <span>IA está pensando...</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Pergunte ao seu advisor IA..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isLoading}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>

        <Button 
          variant="outline" 
          className="mt-4 w-full" 
          onClick={handleGoToAdvisor}
        >
          Abrir conversa completa
        </Button>
      </CardContent>
    </Card>
  );
};
