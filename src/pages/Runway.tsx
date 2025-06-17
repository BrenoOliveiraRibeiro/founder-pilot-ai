
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { RunwaySimulator, SimulationResultType } from "@/components/runway/RunwaySimulator";
import { RunwayDataProvider, useRunwayData } from "@/components/runway/core/RunwayDataProvider";

// Importando os componentes refatorados
import { RunwayHeader } from "@/components/runway/header/RunwayHeader";
import { RunwayWarningAlert } from "@/components/runway/alerts/RunwayWarningAlert";
import { MetricsCards } from "@/components/runway/metrics/MetricsCards";
import { ProjectionChart } from "@/components/runway/chart/ProjectionChart";
import { RecommendationsPanel } from "@/components/runway/recommendations/RecommendationsPanel";

const RunwayContent = () => {
  const { data, generateProjectionData } = useRunwayData();
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  
  // Estados para simulação
  const [simulatedData, setSimulatedData] = useState<{
    cashReserve: number;
    burnRate: number;
    runwayMonths: number;
  } | null>(null);

  // Usar dados simulados se existirem, senão usar dados reais
  const currentData = simulatedData || {
    cashReserve: data.cashReserve,
    burnRate: data.burnRate,
    runwayMonths: data.runwayMonths
  };

  const projectionData = generateProjectionData(currentData.cashReserve, currentData.burnRate);
  
  // Calcular a data estimada de esgotamento
  const estimatedRunoutDate = new Date();
  estimatedRunoutDate.setDate(estimatedRunoutDate.getDate() + Math.floor(currentData.runwayMonths * 30));

  const applySimulation = (result: SimulationResultType) => {
    setSimulatedData({
      cashReserve: result.cashReserve,
      burnRate: result.burnRate,
      runwayMonths: result.runwayMonths
    });
  };

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-lg font-medium text-primary">Carregando dados financeiros reais...</p>
      </div>
    );
  }

  return (
    <>
      <RunwayHeader onSimulatorOpen={() => setSimulatorOpen(true)} />
      
      {!data.hasRealData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Conecte suas contas bancárias para dados reais</h3>
          <p className="text-blue-700 text-sm">
            Para ver projeções baseadas em dados reais, conecte suas contas bancárias via Open Finance na seção de Finanças.
            Os dados exibidos atualmente são demonstrativos.
          </p>
        </div>
      )}
      
      <RunwayWarningAlert runwayMonths={currentData.runwayMonths} />
      
      <MetricsCards
        cashReserve={currentData.cashReserve}
        burnRate={currentData.burnRate}
        runwayMonths={currentData.runwayMonths}
        estimatedRunoutDate={estimatedRunoutDate}
        isRealData={data.hasRealData}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectionChart projectionData={projectionData} />
        <RecommendationsPanel 
          runwayMonths={currentData.runwayMonths} 
          burnRate={currentData.burnRate}
          hasRealData={data.hasRealData}
        />
      </div>

      <RunwaySimulator 
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        initialData={currentData}
        onSimulate={applySimulation}
      />
    </>
  );
};

const RunwayPage = () => {
  return (
    <AppLayout>
      <RunwayDataProvider>
        <RunwayContent />
      </RunwayDataProvider>
    </AppLayout>
  );
};

export default RunwayPage;
