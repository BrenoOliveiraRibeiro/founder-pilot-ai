
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingTooltip } from "../ui/onboarding-tooltip";
import { motion } from "framer-motion";

export const AIAdvisorCard = () => {
  return (
    <OnboardingTooltip
      id="founderpilot-card"
      title="Seu FounderPilot AI"
      description="Aqui você encontra insights e recomendações da IA baseadas em seus dados financeiros e de mercado."
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
        className="h-full"
      >
        <Card className="overflow-hidden border-none shadow-card dark:shadow-none dark:border dark:border-border/40 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-800/90 dark:to-slate-900/90 rounded-2xl h-full">
          <CardContent className="p-6 flex flex-col h-full">
            <motion.div 
              className="flex-grow animate-fade-in"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <div className="flex justify-center items-center my-12">
                <motion.div 
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img 
                    src="/lovable-uploads/d54bd52e-4802-4406-962d-c071db600dcd.png" 
                    alt="FounderPilot AI" 
                    className="w-12 h-12"
                  />
                </motion.div>
              </div>
              
              <h2 className="text-2xl font-medium text-center mb-4">
                Como posso ajudar hoje, empreendedor?
              </h2>
              
              <p className="text-muted-foreground text-center mb-6 max-w-md mx-auto">
                Sou seu FounderPilot AI, especializado em estratégia de startups, análise financeira,
                e suporte à tomada de decisões com base nos seus dados e insights de mercado.
              </p>
            </motion.div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="w-full rounded-full shadow-sm transition-all hover:shadow-md hover:bg-secondary dark:hover:bg-accent mt-4"
            >
              <Link to="/advisor" className="flex items-center justify-center gap-2 px-4 py-2">
                <span>Acessar FounderPilot AI</span> 
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </OnboardingTooltip>
  );
};
