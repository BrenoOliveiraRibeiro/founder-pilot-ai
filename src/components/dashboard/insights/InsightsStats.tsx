
import React from "react";
import { Insight } from "@/integrations/supabase/models";
import { AlertTriangle, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface InsightsStatsProps {
  insights: Insight[];
}

export const InsightsStats: React.FC<InsightsStatsProps> = ({ insights }) => {
  const stats = {
    alertas: insights.filter(i => i.tipo === "alerta").length,
    sugestoes: insights.filter(i => i.tipo === "sugestão").length,
    projecoes: insights.filter(i => i.tipo === "projeção").length,
    alta_prioridade: insights.filter(i => i.prioridade === "alta").length,
  };

  const statItems = [
    {
      label: "Alertas",
      value: stats.alertas,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      label: "Sugestões",
      value: stats.sugestoes,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      label: "Projeções",
      value: stats.projecoes,
      icon: TrendingUp,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      label: "Alta Prioridade",
      value: stats.alta_prioridade,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  if (insights.length === 0) return null;

  return (
    <motion.div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          className={`p-3 rounded-lg border ${stat.bgColor}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
        >
          <div className="flex items-center gap-2">
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
            <div>
              <p className="text-sm font-medium">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};
