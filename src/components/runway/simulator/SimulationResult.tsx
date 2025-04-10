
import React from "react";
import { formatCurrency } from "@/lib/utils";

interface SimulationResultProps {
  result: {
    cashReserve: number;
    burnRate: number;
    runwayMonths: number;
    estimatedRunoutDate: Date;
  };
  onReset: () => void;
  onApply: () => void;
}

export const SimulationResult: React.FC<SimulationResultProps> = ({ 
  result, 
  onReset, 
  onApply 
}) => {
  return (
    <div className="p-4 bg-primary/5 rounded-lg border">
      <h3 className="font-medium mb-2">Resultado da Simulação:</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Novo Caixa:</p>
          <p className="font-medium">{formatCurrency(result.cashReserve)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Novo Burn Rate:</p>
          <p className="font-medium">{formatCurrency(result.burnRate)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Novo Runway:</p>
          <p className={`font-medium ${
            result.runwayMonths < 3 
            ? 'text-red-500' 
            : result.runwayMonths < 6 
              ? 'text-warning' 
              : 'text-green-500'
          }`}>{result.runwayMonths.toFixed(1)} meses</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Nova Data de Esgotamento:</p>
          <p className="font-medium">
            {result.estimatedRunoutDate.toLocaleDateString('pt-BR', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
        </div>
      </div>
    </div>
  );
};
