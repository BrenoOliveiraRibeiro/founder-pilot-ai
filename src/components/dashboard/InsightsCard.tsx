
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useInsights } from "@/hooks/useInsights";
import { InsightsList } from "./insights/InsightsList";

export const InsightsCard = () => {
  const { currentEmpresa } = useAuth();
  const { insights, loading } = useInsights(currentEmpresa?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Insights Gerados por IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <InsightsList 
          insights={insights} 
          loading={loading} 
        />
      </CardContent>
    </Card>
  );
};
