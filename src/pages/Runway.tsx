
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { RunwaySimulator, SimulationResultType } from "@/components/runway/RunwaySimulator";

// Importando os componentes refatorados
import { RunwayHeader } from "@/components/runway/header/RunwayHeader";
import { RunwayWarningAlert } from "@/components/runway/alerts/RunwayWarningAlert";
import { MetricsCards } from "@/components/runway/metrics/MetricsCards";
import { ProjectionChart } from "@/components/runway/chart/ProjectionChart";
import { RecommendationsPanel } from "@/components/runway/recommendations/RecommendationsPanel";

// Dados de exemplo para o gráfico de projeção
const runwayProjectionData = [
  { month: "Abr", cash: 420000 },
  { month: "Mai", cash: 370000 },
  { month: "Jun", cash: 320000 },
  { month: "Jul", cash: 270000 },
  { month: "Ago", cash: 220000 },
  { month: "Set", cash: 170000 },
  { month: "Out", cash: 120000 },
  { month: "Nov", cash: 70000 },
  { month: "Dez", cash: 20000 },
  { month: "Jan", cash: -30000 },
];

const RunwayPage = () => {
  // Estado inicial
  const [cashReserve, setCashReserve] = useState(420000);
  const [burnRate, setBurnRate] = useState(100000);
  const [runwayMonths, setRunwayMonths] = useState(4.2);
  const [projectionData, setProjectionData] = useState(runwayProjectionData);
  
  // Estado para controle do modal de simulação
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Calcular a data estimada de esgotamento
  const estimatedRunoutDate = new Date();
  estimatedRunoutDate.setDate(estimatedRunoutDate.getDate() + Math.floor(runwayMonths * 30));

  // Função para aplicar os resultados da simulação
  const applySimulation = (result: SimulationResultType) => {
    setCashReserve(result.cashReserve);
    setBurnRate(result.burnRate);
    setRunwayMonths(result.runwayMonths);
    
    // Criar novos dados de projeção com base nos valores simulados
    const newProjectionData = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    let currentDate = new Date();
    let remainingCash = result.cashReserve;
    
    for (let i = 0; i < 10; i++) {
      const monthIndex = (currentDate.getMonth() + i) % 12;
      const month = monthNames[monthIndex];
      
      remainingCash -= result.burnRate;
      
      newProjectionData.push({
        month,
        cash: remainingCash,
      });
      
      if (remainingCash < 0) break;
    }
    
    setProjectionData(newProjectionData);
  };

  return (
    <AppLayout>
      <RunwayHeader onSimulatorOpen={() => setSimulatorOpen(true)} />
      
      <RunwayWarningAlert runwayMonths={runwayMonths} />
      
      <MetricsCards
        cashReserve={cashReserve}
        burnRate={burnRate}
        runwayMonths={runwayMonths}
        estimatedRunoutDate={estimatedRunoutDate}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectionChart projectionData={projectionData} />
        <RecommendationsPanel runwayMonths={runwayMonths} burnRate={burnRate} />
      </div>

      {/* Modal de simulação */}
      <RunwaySimulator 
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        initialData={{ cashReserve, burnRate, runwayMonths }}
        onSimulate={applySimulation}
      />
    </AppLayout>
  );
};

export default RunwayPage;
