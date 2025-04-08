
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transformações de escala e opacidade conforme o scroll
  const logoScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, -30]);
  
  return (
    <section 
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-br from-background to-secondary/30 min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{ 
          y: [0, 20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <motion.div
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{ 
          y: [0, -20, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
          delay: 1,
        }}
      />
      
      <motion.div 
        className="container mx-auto max-w-7xl z-10"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="flex flex-col items-center text-center">
          <motion.div 
            style={{ scale: logoScale }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 100, 
              damping: 20,
              duration: 0.8 
            }}
            className="mb-6"
          >
            <FounderPilotLogo className="h-16 w-16 text-primary mb-4" />
          </motion.div>
          
          <motion.h1 
            style={{ scale: titleScale }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gradient"
          >
            FounderPilot AI
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl md:text-2xl text-foreground/80 mb-2"
          >
            Clareza estratégica para fundadores
          </motion.p>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-8"
          >
            Sua IA pessoal para transformar dados em decisões.
            Conecte sua agenda, finanças e operação em uma só interface — simples, poderosa e pensada para você.
          </motion.p>
          
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-2xl md:text-3xl font-semibold mb-8"
          >
            O copiloto estratégico que toda startup merece.
          </motion.h2>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 mt-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.7, 
              delay: 0.6,
              type: "spring",
              stiffness: 100
            }}
            whileHover={{ scale: 1.02 }}
          >
            <Button asChild size="lg" className="text-base px-8 py-6 font-medium shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Link to="/auth">
                Comece gratuitamente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-base px-8 py-6 font-medium">
              <Link to="/auth">
                Fazer login
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
