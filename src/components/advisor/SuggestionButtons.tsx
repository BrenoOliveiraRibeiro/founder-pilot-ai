
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SuggestionButtonsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const SuggestionButtons: React.FC<SuggestionButtonsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
      {suggestions.map((suggestion, index) => (
        <Button
          key={index}
          variant="outline"
          className="justify-between rounded-xl py-3 h-auto border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 backdrop-blur-sm"
          onClick={() => onSuggestionClick(suggestion)}
        >
          <span>{suggestion}</span>
          <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
        </Button>
      ))}
    </div>
  );
};
