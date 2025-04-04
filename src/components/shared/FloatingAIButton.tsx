
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";

export const FloatingAIButton = () => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const { profile } = useAuth();
  const firstName = profile?.nome?.split(' ')[0];

  // Hide tooltip after 5 seconds
  React.useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showTooltip]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300",
                "bg-gradient-to-br from-primary to-primary/80",
                "hover:scale-105 active:scale-95",
                "animate-pulse-subtle"
              )}
              onClick={() => navigate("/advisor")}
            >
              <Brain className="h-7 w-7" />
              <span className="sr-only">Abrir FounderPilot AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" align="center" className="relative max-w-[220px]">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
              onClick={() => setShowTooltip(false)}
            >
              <X className="h-3 w-3" />
            </Button>
            <p className="font-medium">
              {firstName ? `Olá ${firstName}!` : 'Olá empreendedor!'}
            </p>
            <p className="text-xs text-muted-foreground">
              Precisa de um conselho estratégico? Seu copiloto FounderPilot AI está à disposição.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
