
import React, { useState } from "react";
import { Insight } from "@/integrations/supabase/models";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Lightbulb, ExternalLink, Check, X, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface InsightsListProps {
  insights: Insight[] | null;
  loading: boolean;
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights, loading }) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const { toast } = useToast();

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
        <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
        <h4 className="text-lg font-medium mb-2">Nenhum insight encontrado</h4>
        <p className="text-muted-foreground max-w-md">
          Conecte dados bancários ou ajuste os filtros para visualizar insights personalizados.
        </p>
        <Button variant="outline" className="mt-4">
          Conectar Dados Financeiros
        </Button>
      </motion.div>
    );
  }

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
        icon: TrendingUp, 
        className: "text-blue-500 dark:text-blue-400" 
      }
    };
    
    return {
      containerClass: priorityClasses[prioridade as keyof typeof priorityClasses] || priorityClasses.media,
      icon: iconProps[tipo as keyof typeof iconProps]?.icon || Lightbulb,
      iconClass: iconProps[tipo as keyof typeof iconProps]?.className || "text-primary"
    };
  };

  const handleAction = (insightId: string, action: "implementar" | "ignorar") => {
    toast({
      title: action === "implementar" ? "Insight marcado como implementado" : "Insight ignorado",
      description: "Sua ação foi registrada com sucesso.",
    });
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
      className="space-y-4 max-h-96 overflow-y-auto"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {insights.map((insight) => {
          const { containerClass, icon: Icon, iconClass } = getInsightProps(insight.tipo, insight.prioridade);
          const isExpanded = expandedInsight === insight.id;
          
          return (
            <motion.div 
              key={insight.id} 
              className={cn(
                "border rounded-xl transition-all hover:shadow-md", 
                containerClass
              )}
              variants={item}
              layout
            >
              <div className="p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                      <Icon className={cn("h-4 w-4", iconClass)} />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{insight.titulo}</h4>
                          <Badge 
                            variant="secondary" 
                            className={cn(
                              "text-xs",
                              insight.prioridade === "alta" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                              insight.prioridade === "media" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                              insight.prioridade === "baixa" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            )}
                          >
                            {insight.prioridade}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {insight.descricao}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                        className="shrink-0"
                      >
                        <ChevronRight 
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90"
                          )} 
                        />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pl-12"
                    >
                      <div className="space-y-3 border-l-2 border-primary/20 pl-4">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Detalhes do Insight</h5>
                          <p className="text-sm text-muted-foreground">
                            {insight.descricao}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(insight.id, "implementar")}
                            className="flex items-center gap-2"
                          >
                            <Check className="h-3 w-3" />
                            Implementar
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(insight.id, "ignorar")}
                            className="flex items-center gap-2"
                          >
                            <X className="h-3 w-3" />
                            Ignorar
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Saber mais
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Gerado em {new Date(insight.data_criacao).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
