
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface InitialDataInputsProps {
  form: UseFormReturn<any>;
}

export const InitialDataInputs: React.FC<InitialDataInputsProps> = ({ form }) => {
  return (
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
  );
};
