
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AIAdvisorEngine } from "./AIAdvisorEngine";
import { ExternalLink, Brain } from "lucide-react";
import { Link } from "react-router-dom";

export const AIAdvisorCard = () => {
  return (
    <Card className="overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-xl font-medium">Co-Founder IA</CardTitle>
        </div>
        <Button variant="outline" size="sm" asChild className="rounded-full border-primary/20 hover:bg-primary/5">
          <Link to="/advisor" className="flex items-center gap-1.5">
            Acessar IA <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        <AIAdvisorEngine />
      </CardContent>
    </Card>
  );
};
