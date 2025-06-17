
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { runwaySimulationSchema, type RunwaySimulation } from "@/schemas/validationSchemas";

// Importando os componentes refatorados
import { SimulatorHeader } from "./simulator/SimulatorHeader";
import { InitialDataInputs } from "./simulator/InitialDataInputs";
import { ScenarioAdjustments } from "./simulator/ScenarioAdjustments";
import { SimulationResult } from "./simulator/SimulationResult";
import { SimulatorFooter } from "./simulator/SimulatorFooter";
import { calculateSimulation, SimulationResult as SimulationResultType } from "./simulator/simulationUtils";

interface RunwaySimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    cashReserve: number;
    burnRate: number;
    runwayMonths: number;
  };
  onSimulate: (newData: SimulationResultType) => void;
}

export type { SimulationResultType };

export const RunwaySimulator: React.FC<RunwaySimulatorProps> = ({ 
  open, 
  onOpenChange, 
  initialData,
  onSimulate 
}) => {
  const { toast } = useToast();
  const [simulationResult, setSimulationResult] = useState<SimulationResultType | null>(null);

  const form = useForm<RunwaySimulation>({
    resolver: zodResolver(runwaySimulationSchema),
    defaultValues: {
      cashReserve: initialData.cashReserve,
      burnRate: initialData.burnRate,
      revenueIncrease: 0,
      costReduction: 0,
      addFunding: 0,
    },
  });

  const onSubmit = (values: RunwaySimulation) => {
    try {
      // Validar dados antes de calcular
      const validatedValues = runwaySimulationSchema.parse(values);
      
      // Ensure all values are numbers (the schema guarantees this)
      const calculationInputs = {
        cashReserve: validatedValues.cashReserve,
        burnRate: validatedValues.burnRate,
        revenueIncrease: validatedValues.revenueIncrease,
        costReduction: validatedValues.costReduction,
        addFunding: validatedValues.addFunding,
      };
      
      const result = calculateSimulation(calculationInputs);
      setSimulationResult(result);
      
      toast({
        title: "Simulação concluída",
        description: `Runway estimado: ${result.runwayMonths.toFixed(1)} meses`,
      });
    } catch (error: any) {
      console.error("Erro na simulação:", error);
      
      // Se for erro de validação Zod, mostrar erro mais específico
      if (error.name === 'ZodError') {
        toast({
          title: "Dados de simulação inválidos",
          description: `Erro de validação: ${error.errors.map((e: any) => e.message).join(', ')}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na simulação",
          description: "Não foi possível calcular a simulação. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  const applySimulation = () => {
    if (simulationResult) {
      onSimulate(simulationResult);
      onOpenChange(false);
      toast({
        title: "Simulação aplicada",
        description: "Os valores foram atualizados com sucesso.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <SimulatorHeader />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <InitialDataInputs form={form} />
            <ScenarioAdjustments form={form} />

            {simulationResult && (
              <SimulationResult 
                result={simulationResult} 
                onReset={() => setSimulationResult(null)}
                onApply={applySimulation}
              />
            )}

            <SimulatorFooter 
              hasResult={!!simulationResult}
              onCancel={() => onOpenChange(false)}
              onSimulate={form.handleSubmit(onSubmit)}
              onReset={() => setSimulationResult(null)}
              onApply={applySimulation}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
