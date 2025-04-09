
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChevronsUpDown, Calculator, TrendingDown, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface RunwaySimulatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    cashReserve: number;
    burnRate: number;
    runwayMonths: number;
  };
  onSimulate: (newData: SimulationResult) => void;
}

export interface SimulationResult {
  cashReserve: number;
  burnRate: number;
  runwayMonths: number;
  estimatedRunoutDate: Date;
}

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
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

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

  const calculateNewRunway = (values: z.infer<typeof formSchema>) => {
    // Calcular o novo burn rate após as alterações
    const costReductionAmount = (values.costReduction / 100) * values.burnRate;
    const revenueIncreaseAmount = (values.revenueIncrease / 100) * values.burnRate;
    
    const newBurnRate = Math.max(0, values.burnRate - costReductionAmount - revenueIncreaseAmount);
    const newCashReserve = values.cashReserve + values.addFunding;
    
    // Calcular o novo runway (em meses)
    const newRunwayMonths = newBurnRate > 0 ? newCashReserve / newBurnRate : 99;
    
    // Calcular a data estimada de esgotamento
    const estimatedRunoutDate = new Date();
    estimatedRunoutDate.setDate(estimatedRunoutDate.getDate() + Math.floor(newRunwayMonths * 30));
    
    return {
      cashReserve: newCashReserve,
      burnRate: newBurnRate,
      runwayMonths: newRunwayMonths,
      estimatedRunoutDate,
    };
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const result = calculateNewRunway(values);
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Simulador de Cenários de Runway
          </DialogTitle>
          <DialogDescription>
            Ajuste os parâmetros abaixo para simular diferentes cenários financeiros e seu impacto no runway.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="cashReserve"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Caixa Atual</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valor atual em caixa
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="burnRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Burn Rate Mensal</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Gasto mensal atual
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-5">
              <h3 className="text-sm font-medium">Ajustes de Cenário</h3>

              <FormField
                control={form.control}
                name="revenueIncrease"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="flex items-center gap-1.5">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Aumento de Receita
                      </FormLabel>
                      <span className="text-sm font-medium">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Quanto sua receita poderá aumentar (em %)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="costReduction"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel className="flex items-center gap-1.5">
                        <TrendingDown className="h-4 w-4 text-primary" />
                        Redução de Custos
                      </FormLabel>
                      <span className="text-sm font-medium">{field.value}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        value={[field.value]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(vals) => field.onChange(vals[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Quanto você consegue reduzir de custos (em %)
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="addFunding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Captação Adicional
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Valor de captação adicional
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>

            {simulationResult && (
              <div className="p-4 bg-primary/5 rounded-lg border">
                <h3 className="font-medium mb-2">Resultado da Simulação:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Novo Caixa:</p>
                    <p className="font-medium">{formatCurrency(simulationResult.cashReserve)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Novo Burn Rate:</p>
                    <p className="font-medium">{formatCurrency(simulationResult.burnRate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Novo Runway:</p>
                    <p className={`font-medium ${
                      simulationResult.runwayMonths < 3 
                      ? 'text-red-500' 
                      : simulationResult.runwayMonths < 6 
                        ? 'text-warning' 
                        : 'text-green-500'
                    }`}>{simulationResult.runwayMonths.toFixed(1)} meses</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nova Data de Esgotamento:</p>
                    <p className="font-medium">
                      {simulationResult.estimatedRunoutDate.toLocaleDateString('pt-BR', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2 justify-end">
              {simulationResult ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setSimulationResult(null)}>
                    Alterar Simulação
                  </Button>
                  <Button 
                    type="button" 
                    onClick={applySimulation}
                    className="gap-2"
                  >
                    <ChevronsUpDown className="h-4 w-4" />
                    Aplicar Simulação
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Simular</Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
