
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAdvisorEngine } from "./AIAdvisorEngine";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingTooltip } from "../ui/onboarding-tooltip";
import { motion } from "framer-motion";

export const AIAdvisorCard = () => {
  // Animation variants
  const glowAnimation = {
    animate: {
      boxShadow: [
        "0 0 0 rgba(0, 59, 92, 0)",
        "0 0 15px rgba(0, 59, 92, 0.2)",
        "0 0 0 rgba(0, 59, 92, 0)",
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "loop" as const,
      }
    }
  };

  return (
    <OnboardingTooltip
      id="founderpilot-card"
      title="Seu FounderPilot AI"
      description="Aqui você encontra insights e recomendações da IA baseadas em seus dados financeiros e de mercado."
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <Card className="overflow-hidden border-none shadow-card dark:shadow-none dark:border dark:border-border/40 transition-all duration-300 bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-800/90 dark:to-slate-900/90 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100/20 dark:border-gray-800/40">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex h-10 w-10 min-w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400/80 to-amber-500/70 shadow-sm"
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                {...glowAnimation}
              >
                <Sparkles className="h-5 w-5 text-amber-50" />
              </motion.div>
              <CardTitle className="text-xl font-medium text-foreground">
                FounderPilot AI
              </CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="rounded-full shadow-sm transition-all hover:shadow-md hover:bg-secondary dark:hover:bg-accent hidden sm:flex"
            >
              <Link to="/advisor" className="flex items-center gap-2 px-4">
                <span>Acessar</span> 
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 bg-transparent">
            <motion.div 
              className="animate-fade-in"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <AIAdvisorEngine />
            </motion.div>
            <div className="mt-4 flex sm:hidden w-full">
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="rounded-full shadow-sm transition-all hover:shadow-md hover:bg-secondary dark:hover:bg-accent w-full"
              >
                <Link to="/advisor" className="flex items-center justify-center gap-2 px-4">
                  <span>Acessar FounderPilot AI</span> 
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </OnboardingTooltip>
  );
};
