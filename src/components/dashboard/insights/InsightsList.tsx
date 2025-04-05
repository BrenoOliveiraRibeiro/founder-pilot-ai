
import React from "react";
import { Insight } from "@/integrations/supabase/models";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Lightbulb } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InsightsListProps {
  insights: Insight[] | null;
  loading: boolean;
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center text-center p-8 rounded-2xl glass-effect"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Lightbulb className="h-10 w-10 text-muted-foreground mb-4" />
        <h4 className="text-lg font-medium mb-2">Sem insights disponíveis</h4>
        <p className="text-muted-foreground max-w-md">
          Conecte dados bancários ou analise dados de mercado para gerar insights personalizados.
        </p>
      </motion.div>
    );
  }

  // Mapeamento de tipo para ícone e classe
  const getInsightProps = (tipo: string, prioridade: string) => {
    const priorityClasses = {
      alta: "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10",
      media: "border-amber-200 bg-amber-50/50 dark:border-amber-900/30 dark:bg-amber-900/10",
      baixa: "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10"
    };
    
    const iconProps = {
      alerta: { 
        icon: AlertTriangle, 
        className: "text-red-500 dark:text-red-400" 
      },
      sugestão: { 
        icon: CheckCircle, 
        className: "text-green-500 dark:text-green-400" 
      },
      projeção: { 
        icon: tipo === "positiva" ? TrendingUp : TrendingDown, 
        className: tipo === "positiva" 
          ? "text-green-500 dark:text-green-400" 
          : "text-amber-500 dark:text-amber-400" 
      }
    };
    
    return {
      containerClass: priorityClasses[prioridade as keyof typeof priorityClasses] || priorityClasses.media,
      icon: iconProps[tipo as keyof typeof iconProps]?.icon || Lightbulb,
      iconClass: iconProps[tipo as keyof typeof iconProps]?.className || "text-primary"
    };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {insights.map((insight) => {
        const { containerClass, icon: Icon, iconClass } = getInsightProps(insight.tipo, insight.prioridade);
        
        return (
          <motion.div 
            key={insight.id} 
            className={cn(
              "p-4 border rounded-xl transition-all", 
              containerClass
            )}
            variants={item}
            whileHover={{ scale: 1.01, y: -2 }}
          >
            <div className="flex gap-3">
              <div className="mt-0.5">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                  <Icon className={cn("h-5 w-5", iconClass)} />
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">{insight.titulo}</h4>
                {insight.descricao && (
                  <p className="text-sm text-muted-foreground">{insight.descricao}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
