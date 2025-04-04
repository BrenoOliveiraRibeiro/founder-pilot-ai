
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface IntroAnimationProps {
  onComplete?: () => void;
  className?: string;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({
  onComplete,
  className
}) => {
  const [showAnimation, setShowAnimation] = useState(true);
  const [playSound, setPlaySound] = useState(false);

  useEffect(() => {
    // Verifica se a animação já foi mostrada recentemente
    const hasShownIntro = sessionStorage.getItem('hasShownIntro');
    
    if (hasShownIntro) {
      setShowAnimation(false);
      if (onComplete) onComplete();
      return;
    }

    // Reproduz o som após um pequeno delay
    const soundTimer = setTimeout(() => {
      setPlaySound(true);
    }, 300);

    // Define o tempo total da animação
    const animationTimer = setTimeout(() => {
      setShowAnimation(false);
      sessionStorage.setItem('hasShownIntro', 'true');
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(soundTimer);
      clearTimeout(animationTimer);
    };
  }, [onComplete]);

  if (!showAnimation) return null;

  return (
    <motion.div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {playSound && <IntroSound />}
      
      <motion.div
        className="flex flex-col items-center justify-center space-y-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.div 
          className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary to-primary/80 
                    flex items-center justify-center shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <span className="text-primary-foreground font-bold text-4xl">FP</span>
        </motion.div>
        
        <motion.div
          className="text-center space-y-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">FounderPilot AI</h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Para fundadores que pensam grande e agem rápido.
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// Componente para reproduzir o som de introdução
const IntroSound = () => {
  useEffect(() => {
    try {
      const audio = new Audio();
      // Som suave e elegante de startup
      audio.src = "https://assets.mixkit.co/active_storage/sfx/2568/2568.wav";
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Erro ao reproduzir som:", e));
    } catch (error) {
      console.log("Erro ao criar objeto de áudio:", error);
    }
    
    return () => {};
  }, []);
  
  return null;
};
