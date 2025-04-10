
import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator } from "lucide-react";

interface RunwayHeaderProps {
  onSimulatorOpen: () => void;
}

export const RunwayHeader: React.FC<RunwayHeaderProps> = ({ onSimulatorOpen }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análise de Runway</h1>
        <p className="text-muted-foreground">
          Previsões e análises sobre sua reserva financeira
        </p>
      </div>
      <Button onClick={onSimulatorOpen} className="gap-2">
        <Calculator className="h-4 w-4" />
        Simular Cenários
      </Button>
    </div>
  );
};
