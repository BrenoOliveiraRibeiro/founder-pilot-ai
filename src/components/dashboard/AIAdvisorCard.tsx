
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAdvisorEngine } from "./AIAdvisorEngine";
import { ArrowRight, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { OnboardingTooltip } from "../ui/onboarding-tooltip";

export const AIAdvisorCard = () => {
  return (
    <OnboardingTooltip
      id="cofounder-ia-card"
      title="Seu Co-Founder IA"
      description="Aqui você encontra insights e recomendações da IA baseadas em seus dados financeiros e de mercado."
    >
      <Card className="overflow-hidden border-none shadow-md hover:shadow-lg dark:shadow-none dark:border dark:border-border/40 transition-all duration-300 bg-gradient-to-br from-white to-apple-silver/30 dark:from-apple-spacegray dark:to-apple-black/90 rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-apple-silver/20 dark:border-apple-spacegray/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-apple-gold/80 to-apple-silver shadow-sm animate-float">
              <Brain className="h-5 w-5 text-apple-spacegray dark:text-apple-white" />
            </div>
            <CardTitle className="text-xl font-medium text-foreground">
              Co-Founder IA
            </CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild 
            className="rounded-full shadow-sm transition-all hover:shadow-md hover:bg-apple-silver/20 dark:hover:bg-apple-spacegray/60"
          >
            <Link to="/advisor" className="flex items-center gap-2 px-4">
              <span>Acessar</span> 
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-4 bg-transparent">
          <div className="animate-fade-in">
            <AIAdvisorEngine />
          </div>
        </CardContent>
      </Card>
    </OnboardingTooltip>
  );
};
