
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";

export const ConnectBanner = () => {
  const navigate = useNavigate();
  
  const steps = [
    {
      title: "Crie sua conta",
      description: "Registre-se na plataforma para começar",
    },
    {
      title: "Cadastre sua empresa",
      description: "Complete o onboarding com os dados da sua startup",
    },
    {
      title: "Conecte suas contas bancárias",
      description: "Utilize Open Finance para sincronizar seus dados financeiros",
    },
    {
      title: "Acesse insights estratégicos",
      description: "Obtenha análises e recomendações personalizadas para seu negócio",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">Como começar a usar o FounderPilot</h2>
            <p className="text-muted-foreground mb-12">
              Siga estas etapas simples para conectar seus dados financeiros e começar a receber insights estratégicos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 text-left p-6 rounded-lg bg-card/50 border border-border/40 backdrop-blur-sm"
              >
                <div className="bg-primary/10 rounded-full p-2 mt-1">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="px-8 py-6 text-base font-medium flex items-center gap-2"
            >
              Começar agora
              <ArrowRight className="h-5 w-5 ml-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
