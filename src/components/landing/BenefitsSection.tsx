
import React from "react";
import { motion } from "framer-motion";
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
  return (
    <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-secondary/30">
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
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
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`mb-4 p-2 rounded-full w-12 h-12 flex items-center justify-center bg-background ${benefit.color}`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
              <p className="text-foreground/70">{benefit.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
