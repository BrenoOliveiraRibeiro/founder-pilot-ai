
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

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
  const [showLogo, setShowLogo] = useState(false);

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

    // Mostrar o logo após um delay
    const logoTimer = setTimeout(() => {
      setShowLogo(true);
    }, 1200);

    // Exibe o slogan após o logo
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
      clearTimeout(logoTimer);
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
        {showLogo && (
          <motion.div
            className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-8 mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
          >
            <motion.div
              className="w-24 h-24 flex items-center justify-center"
              animate={{ 
                rotate: [0, 10, -10, 5, -5, 0],
                scale: [1, 1.05, 0.98, 1.02, 1]
              }}
              transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
            >
              <img 
                src="/lovable-uploads/54a4acf9-cdb2-49db-8cb9-4fd8754d0e84.png"
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}

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
            Sync Partners
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
