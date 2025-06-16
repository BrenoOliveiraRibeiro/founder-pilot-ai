
import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { RunwaySimulator, SimulationResultType } from "@/components/runway/RunwaySimulator";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";

// Importando os componentes refatorados
import { RunwayHeader } from "@/components/runway/header/RunwayHeader";
import { RunwayWarningAlert } from "@/components/runway/alerts/RunwayWarningAlert";
import { MetricsCards } from "@/components/runway/metrics/MetricsCards";
import { ProjectionChart } from "@/components/runway/chart/ProjectionChart";
import { RecommendationsPanel } from "@/components/runway/recommendations/RecommendationsPanel";

const RunwayPage = () => {
  const { currentEmpresa } = useAuth();
  const { metrics, loading } = useOpenFinanceDashboard();
  
  // Estados iniciais baseados em dados reais ou valores padrão
  const [cashReserve, setCashReserve] = useState(0);
  const [burnRate, setBurnRate] = useState(0);
  const [runwayMonths, setRunwayMonths] = useState(0);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [hasRealData, setHasRealData] = useState(false);
  
  // Estado para controle do modal de simulação
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Atualizar valores quando os dados do Open Finance estiverem disponíveis
  useEffect(() => {
    if (metrics && metrics.integracoesAtivas > 0) {
      setCashReserve(metrics.saldoTotal);
      setBurnRate(metrics.burnRate);
      setRunwayMonths(metrics.runwayMeses);
      setHasRealData(true);
      
      // Gerar dados de projeção baseados nos dados reais
      generateProjectionData(metrics.saldoTotal, metrics.burnRate);
    } else if (metrics && metrics.integracoesAtivas === 0) {
      // Dados demo quando não há integrações
      setCashReserve(420000);
      setBurnRate(100000);
      setRunwayMonths(4.2);
      setHasRealData(false);
      
      generateProjectionData(420000, 100000);
    }
  }, [metrics]);

  // Função para gerar dados de projeção
  const generateProjectionData = (currentCash: number, monthlyBurn: number) => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const newProjectionData = [];
    let remainingCash = currentCash;
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentDate.getMonth() + i) % 12;
      const month = monthNames[monthIndex];
      
      newProjectionData.push({
        month,
        cash: Math.max(0, remainingCash),
      });
      
      remainingCash -= monthlyBurn;
      
      if (remainingCash <= 0 && i > 2) break; // Parar quando o caixa acabar (mas mostrar pelo menos 3 meses)
    }
    
    setProjectionData(newProjectionData);
  };

  // Calcular a data estimada de esgotamento
  const estimatedRunoutDate = new Date();
  estimatedRunoutDate.setDate(estimatedRunoutDate.getDate() + Math.floor(runwayMonths * 30));

  // Função para aplicar os resultados da simulação
  const applySimulation = (result: SimulationResultType) => {
    setCashReserve(result.cashReserve);
    setBurnRate(result.burnRate);
    setRunwayMonths(result.runwayMonths);
    
    // Gerar novos dados de projeção com base nos valores simulados
    generateProjectionData(result.cashReserve, result.burnRate);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="text-lg font-medium text-primary">Carregando dados financeiros reais...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <RunwayHeader onSimulatorOpen={() => setSimulatorOpen(true)} />
      
      {!hasRealData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Conecte suas contas bancárias para dados reais</h3>
          <p className="text-blue-700 text-sm">
            Para ver projeções baseadas em dados reais, conecte suas contas bancárias via Open Finance na seção de Finanças.
            Os dados exibidos atualmente são demonstrativos.
          </p>
        </div>
      )}
      
      <RunwayWarningAlert runwayMonths={runwayMonths} />
      
      <MetricsCards
        cashReserve={cashReserve}
        burnRate={burnRate}
        runwayMonths={runwayMonths}
        estimatedRunoutDate={estimatedRunoutDate}
        isRealData={hasRealData}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProjectionChart projectionData={projectionData} />
        <RecommendationsPanel 
          runwayMonths={runwayMonths} 
          burnRate={burnRate}
          hasRealData={hasRealData}
        />
      </div>

      {hasRealData && metrics?.ultimaAtualizacao && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Dados baseados em informações reais das suas contas bancárias
            <span className="mx-2">•</span>
            Última sincronização: {new Date(metrics.ultimaAtualizacao).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

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
