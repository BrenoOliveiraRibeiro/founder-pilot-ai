
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useInsights } from "@/hooks/useInsights";
import { InsightsHeader } from "./insights/InsightsHeader";
import { InsightsFilters } from "./insights/InsightsFilters";
import { InsightsList } from "./insights/InsightsList";
import { InsightsStats } from "./insights/InsightsStats";

export const InsightsCard = () => {
  const { currentEmpresa } = useAuth();
  const { insights, loading, generateRealTimeInsights } = useInsights(currentEmpresa?.id);
  const [selectedFilter, setSelectedFilter] = useState<string>("todos");
  const [selectedPriority, setSelectedPriority] = useState<string>("todas");

  // Filtrar insights baseado nos filtros selecionados
  const filteredInsights = insights?.filter(insight => {
    const matchesType = selectedFilter === "todos" || insight.tipo === selectedFilter;
    const matchesPriority = selectedPriority === "todas" || insight.prioridade === selectedPriority;
    return matchesType && matchesPriority;
  }) || [];

  const handleRefresh = async () => {
    await generateRealTimeInsights();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <InsightsHeader 
          totalInsights={insights?.length || 0}
          onRefresh={handleRefresh}
          loading={loading}
        />
        <InsightsStats insights={insights || []} />
        <InsightsFilters
          selectedFilter={selectedFilter}
          selectedPriority={selectedPriority}
          onFilterChange={setSelectedFilter}
          onPriorityChange={setSelectedPriority}
        />
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        <InsightsList 
          insights={filteredInsights} 
          loading={loading}
        />
      </CardContent>
    </Card>
  );
};
