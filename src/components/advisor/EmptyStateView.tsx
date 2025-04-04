
import React from "react";
import { Sparkles } from "lucide-react";
import { SuggestionButtons } from "./SuggestionButtons";

interface EmptyStateViewProps {
  userName?: string;
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  userName,
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/80 to-primary/20 flex items-center justify-center shadow-sm animate-float">
        <Sparkles className="h-10 w-10 text-primary/90" />
      </div>
      <h2 className="text-2xl font-medium mb-3">Como posso ajudar hoje, {userName || 'empreendedor'}?</h2>
      <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
        Sou seu FounderPilot AI, especializado em estratégia de startups, análise financeira,
        e suporte à tomada de decisões. Estou conectado aos seus dados financeiros e insights de mercado.
      </p>
      
      <SuggestionButtons 
        suggestions={suggestions}
        onSuggestionClick={onSuggestionClick}
      />
    </div>
  );
};
