import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Briefcase, Building, Calendar, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const empresaFormSchema = z.object({
  nome: z.string().min(2, { message: "Nome da empresa é obrigatório" }),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  num_funcionarios: z.coerce.number().optional(),
  data_fundacao: z.string().optional(),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal('')),
});

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof empresaFormSchema>>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nome: "",
      segmento: "",
      estagio: "",
      num_funcionarios: undefined,
      data_fundacao: "",
      website: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof empresaFormSchema>) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para continuar.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    
    try {
      // Criar empresa
      const { data, error } = await supabase
        .from('empresas')
        .insert([
          {
            user_id: user.id,
            nome: values.nome,
            segmento: values.segmento || null,
            estagio: values.estagio || null,
            num_funcionarios: values.num_funcionarios || null,
            data_fundacao: values.data_fundacao || null,
            website: values.website || null,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Empresa cadastrada com sucesso!",
        description: "Agora vamos conectar seus dados financeiros.",
      });

      // Avançar para o próximo passo ou redirecionar
      if (step < 2) {
        setStep(step + 1);
      } else {
        navigate("/connect");
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar empresa:", error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar a empresa. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mr-3">
              <span className="text-primary-foreground font-bold text-xl">SC</span>
            </div>
            <CardTitle className="text-2xl font-bold">Sync Co-Founder IA</CardTitle>
          </div>
          <CardTitle className="text-xl text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            {step === 1 ? "Fale um pouco sobre sua empresa" : "Conecte suas contas bancárias"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                            <Input className="border-0 p-0 shadow-none focus-visible:ring-0" type="date" {...field} />
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

                <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Continuar"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-6">
              <p className="mb-6">
                Para oferecer insights mais precisos, precisamos conectar sua conta bancária.
              </p>
              <Button onClick={() => navigate("/connect")} className="w-full md:w-auto">
                Ir para conexão bancária <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
