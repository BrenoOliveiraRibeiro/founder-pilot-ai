
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, CreditCard, AlertCircle, LineChart, PiggyBank, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface SuggestionButtonsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const SuggestionButtons: React.FC<SuggestionButtonsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  const isMobile = useIsMobile();
  
  // Ícones para cada tipo de sugestão
  const getIcon = (suggestion: string, index: number) => {
    if (suggestion.includes("runway")) return TrendingUp;
    if (suggestion.includes("gastos") || suggestion.includes("despesas")) return CreditCard;
    if (suggestion.includes("crescimento") || suggestion.includes("MRR")) return LineChart;
    if (suggestion.includes("investimento") || suggestion.includes("captação")) return PiggyBank;
    if (suggestion.includes("burn rate") || suggestion.includes("queima")) return AlertCircle;
    
    // Ícones para sugestões que não correspondem a nenhum padrão específico
    const defaultIcons = [TrendingUp, LineChart, PiggyBank, Target, CreditCard, AlertCircle];
    return defaultIcons[index % defaultIcons.length];
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 20 } 
    }
  };

  return (
    <motion.div 
      className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {suggestions.map((suggestion, index) => {
        const Icon = getIcon(suggestion.toLowerCase(), index);
        
        return (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ 
              scale: isMobile ? 1.01 : 1.02, 
              boxShadow: "0 10px 25px -5px rgba(0, 59, 92, 0.1)",
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="justify-between rounded-xl py-2 sm:py-3 px-3 sm:px-4 h-auto w-full border-primary/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent transition-all duration-300 backdrop-blur-sm group"
              onClick={() => onSuggestionClick(suggestion)}
            >
              <div className="flex items-center gap-2 text-left">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-xs sm:text-sm line-clamp-2">{suggestion}</span>
              </div>
              <div className="group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0 ml-2">
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 opacity-70" />
              </div>
            </Button>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
