
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Users, Briefcase } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { DatePicker } from "@/components/ui/date-picker";

export const empresaFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome da empresa é obrigatório" }),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  num_funcionarios: z.coerce.number().optional(),
  data_fundacao: z.string().optional(),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal('')),
});

type EmpresaFormValues = z.infer<typeof empresaFormSchema>;

interface EmpresaInfoFormProps {
  form: UseFormReturn<EmpresaFormValues>;
}

export const EmpresaInfoForm: React.FC<EmpresaInfoFormProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="nome"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome da empresa</FormLabel>
            <FormControl>
              <div className="flex items-center border rounded-md px-3 py-2">
                <Building className="h-5 w-5 text-muted-foreground mr-2" />
                <Input className="border-0 p-0 shadow-none focus-visible:ring-0" placeholder="Nome da sua startup" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="segmento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Segmento</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SaaS">SaaS</SelectItem>
                  <SelectItem value="Marketplace">Marketplace</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="Healthtech">Healthtech</SelectItem>
                  <SelectItem value="Edtech">Edtech</SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estagio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estágio</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estágio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ideação">Ideação</SelectItem>
                  <SelectItem value="MVP">MVP</SelectItem>
                  <SelectItem value="Pre-seed">Pre-seed</SelectItem>
                  <SelectItem value="Seed">Seed</SelectItem>
                  <SelectItem value="Series A">Series A</SelectItem>
                  <SelectItem value="Series B+">Series B+</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="num_funcionarios"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de funcionários</FormLabel>
              <FormControl>
                <div className="flex items-center border rounded-md px-3 py-2">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <Input 
                    className="border-0 p-0 shadow-none focus-visible:ring-0" 
                    type="number" 
                    placeholder="Quantos funcionários?" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_fundacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de fundação</FormLabel>
              <FormControl>
                <div className="flex items-center border rounded-md px-3 py-2">
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    onDateChange={(date) => field.onChange(date ? date.toISOString().split('T')[0] : '')}
                    placeholder="Quando a empresa foi fundada?"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website (opcional)</FormLabel>
            <FormControl>
              <div className="flex items-center border rounded-md px-3 py-2">
                <Briefcase className="h-5 w-5 text-muted-foreground mr-2" />
                <Input className="border-0 p-0 shadow-none focus-visible:ring-0" placeholder="https://exemplo.com" {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
