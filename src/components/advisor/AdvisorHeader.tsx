
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdvisorHeaderProps {
  empresaNome?: string | null;
  hasFinancialData: boolean;
}

export const AdvisorHeader: React.FC<AdvisorHeaderProps> = ({
  empresaNome,
  hasFinancialData
}) => {
  const isMobile = useIsMobile();

  return (
    <motion.div 
      className="flex items-center mb-4 sm:mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
        <div className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mr-3 sm:mr-5 shadow-lg relative z-10`}>
          <Sparkles className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-white`} />
        </div>
      </div>
      <div className="flex-1">
        <motion.h1 
          className="text-gradient text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          FounderPilot AI
        </motion.h1>
        <motion.div 
          className="flex items-center gap-2 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <p className="text-xs sm:text-sm text-muted-foreground">
            {empresaNome ? `Copiloto estratégico para ${empresaNome}` : 'Seu copiloto estratégico'}
          </p>
          {hasFinancialData ? (
            <Badge variant="outline" className="text-xs">
              <Database className="h-3 w-3 mr-1" />
              Dados Reais
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">
              Demo
            </Badge>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
