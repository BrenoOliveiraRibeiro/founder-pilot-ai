
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
  const [showTagline, setShowTagline] = useState(false);

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
    }, 800);

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
      clearTimeout(soundTimer);
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
      {playSound && <IntroSound />}
      
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
          <motion.h1 
            className="text-5xl font-bold tracking-tight font-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            FounderPilot
          </motion.h1>
          
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

// Componente para reproduzir o som de introdução
const IntroSound = () => {
  useEffect(() => {
    try {
      const audio = new Audio();
      // Som suave e sofisticado similar ao do macOS/Superhuman
      audio.src = "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3";
      audio.volume = 0.4;
      audio.play().catch(e => console.log("Erro ao reproduzir som:", e));
    } catch (error) {
      console.log("Erro ao criar objeto de áudio:", error);
    }
    
    return () => {};
  }, []);
  
  return null;
};
