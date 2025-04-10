
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

import { MarketSizeForm } from "./components/MarketSizeForm";
import { MarketOverviewTab } from "./components/MarketOverviewTab";
import { CompetitorsTab } from "./components/CompetitorsTab";
import { InsightsTab } from "./components/InsightsTab";
import { RawAnalysisTab } from "./components/RawAnalysisTab";
import { useMarketAnalysis } from "./hooks/useMarketAnalysis";

export const MarketSizeAnalysis = () => {
  const { toast } = useToast();
  const {
    segment,
    setSegment,
    region,
    setRegion,
    customerType,
    setCustomerType,
    isLoading,
    hasAnalysis,
    tamSamSomData,
    competitorsData,
    insights,
    growthProjection,
    entryBarriers,
    rawAiData,
    aiEnriched,
    empresaData,
    currentTab,
    setCurrentTab,
    handleAnalyze,
    resetAnalysis
  } = useMarketAnalysis();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Análise de Mercado com IA (TAM, SAM e SOM)</CardTitle>
            </div>
            {hasAnalysis && (
              <Button variant="outline" size="sm" onClick={resetAnalysis}>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Nova Análise
              </Button>
            )}
          </div>
          <CardDescription>
            Estimativa do tamanho de mercado e oportunidade de negócio com base em dados de mercado e IA
            {empresaData && (
              <span className="ml-1 text-primary">
                (enriquecido com dados da sua empresa)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAnalysis ? (
            <MarketSizeForm
              segment={segment}
              setSegment={setSegment}
              region={region}
              setRegion={setRegion}
              customerType={customerType}
              setCustomerType={setCustomerType}
              handleAnalyze={handleAnalyze}
              isLoading={isLoading}
            />
          ) : (
            <div className="space-y-4">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="competitors">Competidores</TabsTrigger>
                  <TabsTrigger value="insights">Insights Estratégicos</TabsTrigger>
                  {rawAiData && (
                    <TabsTrigger value="raw">Análise Detalhada</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="overview">
                  <MarketOverviewTab 
                    tamSamSomData={tamSamSomData}
                    insights={insights}
                    growthProjection={growthProjection}
                    entryBarriers={entryBarriers}
                    competitorsData={competitorsData}
                    segment={segment}
                    aiEnriched={aiEnriched}
                  />
                </TabsContent>
                
                <TabsContent value="competitors">
                  <CompetitorsTab 
                    competitorsData={competitorsData}
                    tamSamSomData={tamSamSomData}
                    customerType={customerType}
                  />
                </TabsContent>
                
                <TabsContent value="insights">
                  <InsightsTab 
                    insights={insights}
                    growthProjection={growthProjection}
                    entryBarriers={entryBarriers}
                    segment={segment}
                    customerType={customerType}
                  />
                </TabsContent>
                
                {rawAiData && (
                  <TabsContent value="raw">
                    <RawAnalysisTab 
                      rawAiData={rawAiData}
                      segment={segment}
                      region={region}
                      customerType={customerType}
                    />
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
