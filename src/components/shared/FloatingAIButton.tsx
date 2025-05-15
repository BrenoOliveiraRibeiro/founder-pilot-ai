
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X, Brain, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FounderPilotLogo } from "./FounderPilotLogo";

export const FloatingAIButton = () => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(true);
  const [showMessages, setShowMessages] = useState(false);
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

  const handleClick = () => {
    if (showMessages) {
      setShowMessages(false);
    } else {
      navigate("/advisor");
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showMessages && (
          <motion.div
            className="absolute bottom-20 right-0 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-primary/10"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center gap-1.5">
                <FounderPilotLogo className="w-3.5 h-3.5" />
                FounderPilot
              </h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 rounded-full"
                onClick={() => setShowMessages(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="p-3">
              <div className="text-xs bg-primary/5 p-2 rounded-lg mb-2">
                Como posso ajudar com suas finanças hoje?
              </div>
              <div className="space-y-1.5">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-1.5 px-2"
                  onClick={() => navigate("/advisor")}
                >
                  Qual é minha runway atual?
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full justify-start text-xs h-auto py-1.5 px-2"
                  onClick={() => navigate("/advisor")}
                >
                  Como reduzir meu burn rate?
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full mt-2 text-xs h-auto py-1.5"
                  onClick={() => navigate("/advisor")}
                >
                  Abrir Assistente Completo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <TooltipProvider>
        <Tooltip open={showTooltip && !showMessages}>
          <TooltipTrigger asChild>
            <Button
              size="lg"
              className={cn(
                "rounded-full h-16 w-16 shadow-lg hover:shadow-xl transition-all duration-300",
                "bg-gradient-to-br from-primary to-primary/80",
                "hover:scale-105 active:scale-95",
                "animate-pulse-subtle"
              )}
              onClick={handleClick}
            >
              <MessageSquare className="h-7 w-7" />
              <span className="sr-only">Abrir FounderPilot</span>
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
              Precisa de um conselho estratégico? Seu FounderPilot está à disposição.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
