
import React, { createContext, useContext, ReactNode } from 'react';
import { useOpenFinanceDashboard } from '@/hooks/useOpenFinanceDashboard';

interface RunwayData {
  cashReserve: number;
  burnRate: number;
  runwayMonths: number;
  hasRealData: boolean;
  loading: boolean;
}

interface RunwayDataContextType {
  data: RunwayData;
  generateProjectionData: (currentCash: number, monthlyBurn: number) => any[];
}

const RunwayDataContext = createContext<RunwayDataContextType | undefined>(undefined);

export const useRunwayData = () => {
  const context = useContext(RunwayDataContext);
  if (!context) {
    throw new Error('useRunwayData must be used within a RunwayDataProvider');
  }
  return context;
};

interface RunwayDataProviderProps {
  children: ReactNode;
}

export const RunwayDataProvider: React.FC<RunwayDataProviderProps> = ({ children }) => {
  const { metrics, loading } = useOpenFinanceDashboard();

  const generateProjectionData = (currentCash: number, monthlyBurn: number) => {
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const projectionData = [];
    let remainingCash = currentCash;
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentDate.getMonth() + i) % 12;
      const month = monthNames[monthIndex];
      
      projectionData.push({
        month,
        cash: Math.max(0, remainingCash),
      });
      
      remainingCash -= monthlyBurn;
      
      if (remainingCash <= 0 && i > 2) break;
    }
    
    return projectionData;
  };

  const runwayData: RunwayData = {
    cashReserve: metrics?.saldoTotal || (metrics?.integracoesAtivas === 0 ? 420000 : 0),
    burnRate: metrics?.burnRate || (metrics?.integracoesAtivas === 0 ? 100000 : 0),
    runwayMonths: metrics?.runwayMeses || (metrics?.integracoesAtivas === 0 ? 4.2 : 0),
    hasRealData: (metrics?.integracoesAtivas || 0) > 0,
    loading
  };

  const contextValue: RunwayDataContextType = {
    data: runwayData,
    generateProjectionData
  };

  return (
    <RunwayDataContext.Provider value={contextValue}>
      {children}
    </RunwayDataContext.Provider>
  );
};
