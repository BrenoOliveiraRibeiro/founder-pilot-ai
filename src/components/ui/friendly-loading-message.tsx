
import React, { useEffect, useState } from "react";

// Mensagens de carregamento focadas em estratégia e mentoria
const friendlyMessages = [
  "Analisando o contexto financeiro da sua startup...",
  "Processando benchmarks de mercado para comparações precisas...",
  "Calculando o impacto no seu runway e estratégia de crescimento...",
  "Integrando indicadores de negócio ao seu caso específico...",
  "Estruturando recomendações baseadas na sua fase atual...",
  "Avaliando oportunidades estratégicas para seu setor...",
  "Formulando insights personalizados para seu momento...",
  "Conectando sua pergunta às melhores práticas do ecossistema...",
  "Seu copiloto está preparando uma resposta estratégica...",
];

interface FriendlyLoadingMessageProps {
  isLoading: boolean;
  className?: string;
}

export const FriendlyLoadingMessage: React.FC<FriendlyLoadingMessageProps> = ({ 
  isLoading, 
  className = "" 
}) => {
  const [message, setMessage] = useState(friendlyMessages[0]);
  
  useEffect(() => {
    if (!isLoading) return;
    
    const randomIndex = Math.floor(Math.random() * friendlyMessages.length);
    setMessage(friendlyMessages[randomIndex]);
    
    const interval = setInterval(() => {
      const newIndex = Math.floor(Math.random() * friendlyMessages.length);
      setMessage(friendlyMessages[newIndex]);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isLoading]);
  
  if (!isLoading) return null;
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex space-x-1">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
      </div>
      <p className="text-sm font-medium text-foreground/80 animate-fade-in">{message}</p>
    </div>
  );
};
