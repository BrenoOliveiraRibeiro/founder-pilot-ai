
import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AlertTriangle, BarChart2, TrendingUp, DollarSign, BookOpen } from "lucide-react";

const benefits = [
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Alertas de risco e oportunidade",
    description: "Receba notificações em tempo real sobre problemas potenciais ou oportunidades de mercado.",
    color: "text-warning"
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Benchmarking com startups similares",
    description: "Compare seu desempenho com startups do mesmo segmento e estágio para insights valiosos.",
    color: "text-primary"
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "Sugestões para aumentar vendas",
    description: "Estratégias personalizadas baseadas em seus dados para impulsionar seu crescimento.",
    color: "text-green-500"
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: "Clareza de fluxo de caixa",
    description: "Visualize projeções financeiras e entenda seu runway com precisão.",
    color: "text-blue-500"
  },
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "Insights inspirados por filosofia prática",
    description: "Decisões estratégicas baseadas em princípios de Nietzsche, Sêneca e Frankl.",
    color: "text-purple-500"
  }
];

export const BenefitsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transformações com base no progresso do scroll
  const scale = useTransform(scrollYProgress, [0, 0.6], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.6, 1]);
  const y = useTransform(scrollYProgress, [0, 0.6], [60, 0]);
  
  return (
    <section 
      ref={sectionRef}
      className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30 overflow-hidden"
    >
      <motion.div 
        className="container mx-auto max-w-7xl"
        style={{ scale, opacity, y }}
      >
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Benefícios Diretos</h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Construído para potencializar seus resultados e otimizar decisões
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index}
              className="p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300"
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ 
                duration: 0.5, 
                delay: 0.1 * index,
                type: "spring",
                stiffness: 50 
              }}
              whileHover={{ 
                scale: 1.03, 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className={`mb-4 p-2 rounded-full w-12 h-12 flex items-center justify-center bg-background ${benefit.color}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.7 }}
              >
                {benefit.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-foreground/70">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
