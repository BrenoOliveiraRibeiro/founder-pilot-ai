
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calculator } from "lucide-react";

export const SimulatorHeader: React.FC = () => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Calculator className="h-5 w-5" />
        Simulador de Cenários de Runway
      </DialogTitle>
      <DialogDescription>
        Ajuste os parâmetros abaixo para simular diferentes cenários financeiros e seu impacto no runway.
      </DialogDescription>
    </DialogHeader>
  );
};
