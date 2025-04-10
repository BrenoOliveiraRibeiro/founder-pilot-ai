
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

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

const formSchema = z.object({
  cashReserve: z.number().min(0, "O valor deve ser positivo"),
  burnRate: z.number().min(0, "O valor deve ser positivo"),
  revenueIncrease: z.number(),
  costReduction: z.number(),
  addFunding: z.number().min(0, "O valor deve ser positivo"),
});

export const RunwaySimulator: React.FC<RunwaySimulatorProps> = ({ 
  open, 
  onOpenChange, 
  initialData,
  onSimulate 
}) => {
  const { toast } = useToast();
  const [simulationResult, setSimulationResult] = useState<SimulationResultType | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashReserve: initialData.cashReserve,
      burnRate: initialData.burnRate,
      revenueIncrease: 0,
      costReduction: 0,
      addFunding: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Assegurando que todos os valores existam antes de calcular
    const simulationInputs = {
      cashReserve: values.cashReserve || 0,
      burnRate: values.burnRate || 0,
      revenueIncrease: values.revenueIncrease || 0,
      costReduction: values.costReduction || 0,
      addFunding: values.addFunding || 0,
    };
    
    const result = calculateSimulation(simulationInputs);
    setSimulationResult(result);
    
    toast({
      title: "Simulação concluída",
      description: `Runway estimado: ${result.runwayMonths.toFixed(1)} meses`,
    });
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
