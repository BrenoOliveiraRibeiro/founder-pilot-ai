
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ChevronsUpDown } from "lucide-react";

interface SimulatorFooterProps {
  hasResult: boolean;
  onCancel: () => void;
  onSimulate: () => void;
  onReset: () => void;
  onApply: () => void;
}

export const SimulatorFooter: React.FC<SimulatorFooterProps> = ({ 
  hasResult, 
  onCancel, 
  onSimulate,
  onReset,
  onApply 
}) => {
  return (
    <DialogFooter className="flex gap-2 justify-end">
      {hasResult ? (
        <>
          <Button type="button" variant="outline" onClick={onReset}>
            Alterar Simulação
          </Button>
          <Button 
            type="button" 
            onClick={onApply}
            className="gap-2"
          >
            <ChevronsUpDown className="h-4 w-4" />
            Aplicar Simulação
          </Button>
        </>
      ) : (
        <>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" onClick={onSimulate}>Simular</Button>
        </>
      )}
    </DialogFooter>
  );
};
