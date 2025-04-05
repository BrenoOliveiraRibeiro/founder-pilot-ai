
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart2 } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Motor de Análise IA</h3>
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
