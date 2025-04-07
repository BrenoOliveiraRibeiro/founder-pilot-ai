
import React from "react";
import { motion } from "framer-motion";
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
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Três etapas simples para transformar a gestão da sua startup
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-card to-secondary/50 border border-border/50 shadow-sm"
              variants={item}
            >
              <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-foreground/70">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
