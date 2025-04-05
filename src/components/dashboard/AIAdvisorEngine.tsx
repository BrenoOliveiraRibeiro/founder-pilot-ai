
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart2, Sparkles } from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { InsightsList } from "./insights/InsightsList";
import { ConnectionTestResults } from "./insights/ConnectionTestResults";
import { ActionButtons } from "./insights/ActionButtons";

export const AIAdvisorEngine = () => {
  const { currentEmpresa } = useAuth();
  const { 
    insights, 
    loading, 
    syncingData, 
    testingConnection, 
    testResult, 
    error, 
    syncMarketData, 
    testBelvoConnection 
  } = useInsights(currentEmpresa?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-xl font-medium">Motor de Análise IA</h3>
        </div>
        <ActionButtons 
          onTestConnection={testBelvoConnection}
          onSyncData={syncMarketData}
          testingConnection={testingConnection}
          syncingData={syncingData}
          disabled={!currentEmpresa?.id}
        />
      </div>
      
      <ConnectionTestResults 
        error={error} 
        testResult={testResult} 
      />
      
      <InsightsList 
        insights={insights} 
        loading={loading} 
      />
    </div>
  );
};
