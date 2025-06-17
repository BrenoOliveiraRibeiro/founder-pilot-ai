
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Globe, Target, RefreshCw, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const marketFormSchema = z.object({
  segment: z.string().min(2, "Segmento deve ter pelo menos 2 caracteres"),
  region: z.string().min(2, "Região deve ter pelo menos 2 caracteres"),
  customerType: z.enum(["B2B", "B2C", "PME", "Enterprise"], {
    required_error: "Selecione um tipo de cliente",
  }),
});

type MarketFormValues = z.infer<typeof marketFormSchema>;

interface MarketSizeFormProps {
  segment: string;
  setSegment: (value: string) => void;
  region: string;
  setRegion: (value: string) => void;
  customerType: string;
  setCustomerType: (value: string) => void;
  handleAnalyze: () => void;
  isLoading: boolean;
}

export const MarketSizeForm: React.FC<MarketSizeFormProps> = ({
  segment,
  setSegment,
  region,
  setRegion,
  customerType,
  setCustomerType,
  handleAnalyze,
  isLoading
}) => {
  const form = useForm<MarketFormValues>({
    resolver: zodResolver(marketFormSchema),
    defaultValues: {
      segment,
      region,
      customerType: customerType as MarketFormValues["customerType"] || "B2B",
    },
  });

  const onSubmit = (data: MarketFormValues) => {
    setSegment(data.segment);
    setRegion(data.region);
    setCustomerType(data.customerType);
    handleAnalyze();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="segment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  Segmento de atuação
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Fintech, Marketplace, SaaS B2B" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-green-500" />
                  Região geográfica
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: Brasil, América Latina, SP Capital" 
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customerType"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-purple-500" />
                  Tipo de cliente
                </FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="B2B">B2B</SelectItem>
                    <SelectItem value="B2C">B2C</SelectItem>
                    <SelectItem value="PME">PME</SelectItem>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analisar Mercado
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
