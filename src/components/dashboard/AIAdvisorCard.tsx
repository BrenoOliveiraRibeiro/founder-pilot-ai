
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAdvisorEngine } from "./AIAdvisorEngine";
import { ArrowRight, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export const AIAdvisorCard = () => {
  return (
    <Card className="overflow-hidden border-none shadow-apple hover:shadow-apple-hover transition-all duration-300 bg-gradient-to-br from-white/90 to-secondary/60 dark:from-card dark:to-card/70 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/60 shadow-sm animate-float">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-medium">
            Co-Founder IA
          </CardTitle>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          asChild 
          className="rounded-full shadow-sm transition-all hover:shadow-md hover:bg-white/80 dark:hover:bg-card"
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
  );
};
