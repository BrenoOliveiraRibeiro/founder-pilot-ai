
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAdvisorEngine } from "./AIAdvisorEngine";
import { ExternalLink, Brain, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const AIAdvisorCard = () => {
  return (
    <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 shadow-md animate-pulse-subtle">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Co-Founder IA
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Seu copiloto estratégico</p>
          </div>
        </div>
        <Button variant="default" size="sm" asChild className="rounded-full shadow-sm transition-all hover:shadow-md hover:scale-105">
          <Link to="/advisor" className="flex items-center gap-2 px-4">
            <span>Acessar</span> <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-5 bg-gradient-to-b from-transparent to-background/40 rounded-b-lg">
        <div className="animate-fade-in">
          <AIAdvisorEngine />
        </div>
      </CardContent>
    </Card>
  );
};
