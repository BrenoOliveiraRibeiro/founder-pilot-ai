
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface ScenarioAdjustmentsProps {
  form: UseFormReturn<any>;
}

export const ScenarioAdjustments: React.FC<ScenarioAdjustmentsProps> = ({ form }) => {
  return (
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
            <FormMessage />
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
            <FormMessage />
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
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
