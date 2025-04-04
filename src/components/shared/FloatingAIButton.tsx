
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const FloatingAIButton = () => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide tooltip after 5 seconds
  React.useEffect(() => {
    if (showTooltip) {
      const timer = setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
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
                "rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300",
                "bg-gradient-to-br from-primary to-primary/80",
                "hover:scale-105 active:scale-95"
              )}
              onClick={() => navigate("/advisor")}
            >
              <Brain className="h-6 w-6" />
              <span className="sr-only">Abrir FounderPilot AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" align="center" className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0"
              onClick={() => setShowTooltip(false)}
            >
              <X className="h-3 w-3" />
            </Button>
            <p className="font-medium">Converse com seu FounderPilot AI</p>
            <p className="text-xs text-muted-foreground">
              Clique para obter insights e recomendações
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
