
import React from "react";
import { Insight } from "@/integrations/supabase/models";
import { AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface InsightsListProps {
  insights: Insight[];
  loading: boolean;
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights, loading }) => {
  const getIconForInsight = (tipo: string) => {
    switch (tipo) {
      case "alerta":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      case "projeção":
        return <TrendingUp className="h-5 w-5 text-primary" />;
      default:
        return <Lightbulb className="h-5 w-5 text-primary" />;
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "border-destructive/20 bg-destructive/5";
      case "media":
        return "border-warning/20 bg-warning/5";
      case "baixa":
        return "border-success/20 bg-success/5";
      default:
        return "border-primary/20 bg-primary/5";
    }
  };

  const getPriorityBadge = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return <Badge variant="destructive" className="ml-2">Urgente</Badge>;
      case "media":
        return <Badge variant="warning" className="ml-2">Importante</Badge>;
      case "baixa":
        return null;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="w-full h-24" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Lightbulb className="h-10 w-10 mx-auto mb-2 opacity-50" />
        <p>Sem insights disponíveis.</p>
        <p className="text-sm">Conecte dados bancários ou analise dados de mercado para gerar insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <div 
          key={insight.id} 
          className={`p-4 rounded-md border ${getPriorityColor(insight.prioridade)}`}
        >
          <div className="flex items-start gap-3">
            {getIconForInsight(insight.tipo)}
            <div>
              <h4 className="font-medium text-sm mb-1 flex items-center">
                {insight.titulo}
                {getPriorityBadge(insight.prioridade)}
              </h4>
              <p className="text-xs text-muted-foreground">{insight.descricao}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
