
import React, { useEffect, useState } from "react";

const friendlyMessages = [
  "Pensando com carinho no que é melhor pra sua startup...",
  "Analisando seus dados. Um segundo de foco pode mudar o jogo.",
  "Seu copiloto está traçando o melhor caminho. Aguenta aí.",
  "Conectando dados financeiros com sabedoria de mercado...",
  "Calibrando insights para seu momento atual...",
  "Preparando recomendações exclusivas para você..."
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
    }, 5000);
    
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
