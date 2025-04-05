
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface SuggestionButtonsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
}

export const SuggestionButtons: React.FC<SuggestionButtonsProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
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
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {suggestions.map((suggestion, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          whileHover={{ 
            scale: 1.02, 
            boxShadow: "0 10px 25px -5px rgba(0, 59, 92, 0.1)",
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="justify-between rounded-xl py-4 px-5 h-auto w-full border-primary/20 hover:border-primary/40 hover:bg-gradient-to-br hover:from-primary/5 hover:to-transparent transition-all duration-300 backdrop-blur-sm group"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-left">{suggestion}</span>
            </div>
            <div className="group-hover:translate-x-1 transition-transform duration-300">
              <ArrowRight className="h-4 w-4 opacity-70" />
            </div>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};
