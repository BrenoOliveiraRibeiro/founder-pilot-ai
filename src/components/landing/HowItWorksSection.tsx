
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, Brain, LineChart } from "lucide-react";

const steps = [
  {
    icon: <Calendar className="h-8 w-8" />,
    title: "Integre seus dados",
    description: "Google Calendar, Belvo, Notion e outras integrações que facilitam a centralização das informações.",
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Deixe a IA analisar",
    description: "Nossa IA processa seus dados e gera insights relevantes para o seu negócio em tempo real.",
  },
  {
    icon: <LineChart className="h-8 w-8" />,
    title: "Tome decisões inteligentes",
    description: "Acompanhe indicadores, receba recomendações e tome decisões baseadas em dados concretos.",
  }
];

export const HowItWorksSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transformações com base no progresso do scroll
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.85, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.5, 1]);
  
  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background overflow-hidden"
    >
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          style={{ scale, opacity }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Como Funciona
          </motion.h2>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-foreground/70 max-w-2xl mx-auto"
          >
            Três etapas simples para transformar a gestão da sua startup
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          style={{ scale, opacity }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-card to-secondary/50 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2 + index * 0.15,
                type: "spring",
                stiffness: 50
              }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="mb-4 p-4 rounded-full bg-primary/10 text-primary"
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                {step.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
