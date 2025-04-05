
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { InsightsList } from "./insights/InsightsList";
import { ActionButtons } from "./insights/ActionButtons";

export const AIAdvisorEngine = () => {
  const { currentEmpresa } = useAuth();
  const { 
    insights, 
    loading, 
    syncingData, 
    error, 
    syncMarketData
  } = useInsights(currentEmpresa?.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="text-lg font-medium">Insights IA</h3>
        </div>
        <ActionButtons 
          onSyncData={syncMarketData}
          syncingData={syncingData}
          disabled={!currentEmpresa?.id}
        />
      </div>
      
      <InsightsList 
        insights={insights} 
        loading={loading} 
      />
    </div>
  );
};
