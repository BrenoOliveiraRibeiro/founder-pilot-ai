
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, TrendingUp, Filter } from "lucide-react";

interface InsightsFiltersProps {
  selectedFilter: string;
  selectedPriority: string;
  onFilterChange: (filter: string) => void;
  onPriorityChange: (priority: string) => void;
}

export const InsightsFilters: React.FC<InsightsFiltersProps> = ({
  selectedFilter,
  selectedPriority,
  onFilterChange,
  onPriorityChange
}) => {
  const typeFilters = [
    { id: "todos", label: "Todos", icon: null },
    { id: "alerta", label: "Alertas", icon: AlertTriangle, color: "text-red-500" },
    { id: "sugestão", label: "Sugestões", icon: CheckCircle, color: "text-green-500" },
    { id: "projeção", label: "Projeções", icon: TrendingUp, color: "text-blue-500" }
  ];

  const priorityFilters = [
    { id: "todas", label: "Todas" },
    { id: "alta", label: "Alta", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    { id: "media", label: "Média", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    { id: "baixa", label: "Baixa", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" }
  ];

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Tipo:</span>
          {typeFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(filter.id)}
              className="h-7 text-xs flex items-center gap-1"
            >
              {filter.icon && (
                <filter.icon className={`h-3 w-3 ${filter.color || ""}`} />
              )}
              {filter.label}
            </Button>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground">Prioridade:</span>
          {priorityFilters.map((priority) => (
            <Badge
              key={priority.id}
              variant={selectedPriority === priority.id ? "default" : "outline"}
              className={`cursor-pointer text-xs ${
                selectedPriority === priority.id ? "" : priority.color || ""
              }`}
              onClick={() => onPriorityChange(priority.id)}
            >
              {priority.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
