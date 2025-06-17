
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Wallet, TrendingDown } from "lucide-react";

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
            <FormLabel className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4 text-blue-500" />
              Caixa Atual
            </FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </FormControl>
            <FormDescription>
              Valor atual em caixa
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="burnRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Burn Rate Mensal
            </FormLabel>
            <FormControl>
              <div className="flex items-center">
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </FormControl>
            <FormDescription>
              Gasto mensal atual
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
