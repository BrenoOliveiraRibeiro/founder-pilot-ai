
import React from "react";
import { Sparkles } from "lucide-react";
import { SuggestionButtons } from "./SuggestionButtons";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Animation variants for the container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Particles for the background effect - reduced number for mobile
  const particles = Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-primary/10 dark:bg-primary/20"
      style={{
        width: Math.random() * (isMobile ? 20 : 30) + 10,
        height: Math.random() * (isMobile ? 20 : 30) + 10,
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 90}%`,
      }}
      animate={{
        y: [0, -10, 0],
        opacity: [0.2, 0.5, 0.2],
      }}
      transition={{
        duration: Math.random() * 5 + 5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: Math.random() * 2
      }}
    />
  ));

  return (
    <motion.div 
      className="text-center py-8 sm:py-12 relative overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Background particles */}
      {particles}
      
      <motion.div 
        variants={itemVariants}
        className="relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl rounded-full"></div>
        <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-primary/80 to-primary/20 flex items-center justify-center shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-60"></div>
          <motion.div
            animate={{ 
              rotate: 360,
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(255,255,255,0.2)_70%)]"
          />
          <Sparkles className="h-8 w-8 sm:h-12 sm:w-12 text-white drop-shadow-lg" />
        </div>
      </motion.div>

      <motion.h2 
        className="text-xl sm:text-3xl font-medium mb-3 sm:mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent px-4"
        variants={itemVariants}
      >
        Como posso ajudar hoje?
      </motion.h2>
      
      <motion.p 
        className="text-xs sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto px-4"
        variants={itemVariants}
      >
        Sou seu FounderPilot AI, especializado em estratégia, finanças, e suporte à tomada de decisões com base nos seus dados.
      </motion.p>
      
      <motion.div variants={itemVariants} className="px-2 sm:px-4">
        <SuggestionButtons 
          suggestions={suggestions}
          onSuggestionClick={onSuggestionClick}
        />
      </motion.div>
    </motion.div>
  );
};
