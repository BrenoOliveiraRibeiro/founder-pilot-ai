
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "./FounderPilotLogo";

interface IntroAnimationProps {
  onComplete?: () => void;
  className?: string;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  className
}) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    // Verifica se a animação já foi mostrada recentemente
    const hasShownIntro = sessionStorage.getItem('hasShownIntro');
    
    if (hasShownIntro) {
      setShowAnimation(false);
      if (onComplete) onComplete();
      return;
    }

    // Exibe o slogan após um delay
    const taglineTimer = setTimeout(() => {
      setShowTagline(true);
    }, 2400);

    // Define o tempo total da animação - aumentado para 6 segundos
    const animationTimer = setTimeout(() => {
      setShowAnimation(false);
      sessionStorage.setItem('hasShownIntro', 'true');
      if (onComplete) onComplete();
    }, 6500);

    return () => {
      clearTimeout(taglineTimer);
      clearTimeout(animationTimer);
    };
  }, [onComplete]);

  if (!showAnimation) return null;

  return (
    <motion.div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-founderpilot-background",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.0 }}
    >
      <motion.div
        className="flex flex-col items-center justify-center space-y-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1.0, ease: "easeOut" }}
      >
        <motion.div
          className="text-center space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <motion.div 
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <FounderPilotLogo className="h-12 w-12 text-foreground" />
            <h1 className="text-5xl font-bold tracking-tight font-display">
              FounderPilot
            </h1>
          </motion.div>
          
          {showTagline && (
            <motion.p 
              className="text-xl text-founderpilot-primary/90 font-medium"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.0 }}
            >
              Para fundadores que pensam grande e agem rápido.
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
