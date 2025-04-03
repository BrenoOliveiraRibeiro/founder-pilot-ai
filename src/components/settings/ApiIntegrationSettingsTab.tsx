
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { BanknoteIcon, CalendarIcon, PlusIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const apiKeySchema = z.object({
  googleCalendarApiKey: z.string().optional(),
  linkedinToken: z.string().optional(),
});

type ApiKeyValues = z.infer<typeof apiKeySchema>;

export function ApiIntegrationSettingsTab() {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const connectedServices = [
    { 
      id: "openfinance", 
      name: "Open Finance", 
      status: "connected", 
      lastSync: "Hoje, 14:30", 
      icon: BanknoteIcon 
    },
    { 
      id: "googlecalendar", 
      name: "Google Calendar", 
      status: "pending", 
      lastSync: "Nunca sincronizado", 
      icon: CalendarIcon 
    },
  ];

  const form = useForm<ApiKeyValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      googleCalendarApiKey: "",
      linkedinToken: "",
    },
  });

  function onSubmit(data: ApiKeyValues) {
    toast({
      title: "Chaves API salvas",
      description: "Suas chaves de API foram salvas com sucesso.",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Integrações API</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie suas integrações com APIs externas e serviços conectados.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Serviços conectados</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {connectedServices.map((service) => (
            <Card key={service.id} className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">{service.name}</CardTitle>
                <Badge variant={service.status === "connected" ? "default" : "outline"}>
                  {service.status === "connected" ? "Conectado" : "Pendente"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Última sincronização</p>
                    <p className="font-medium">{service.lastSync}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-border/60 pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    navigate("/connect");
                  }}
                >
                  {service.status === "connected" ? "Resincronizar" : "Conectar"}
                </Button>
              </CardFooter>
            </Card>
          ))}

          <Card className="border-dashed border-border/60 bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center h-full py-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <PlusIcon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-base font-medium mb-1">Adicionar nova integração</CardTitle>
              <CardDescription>
                Conecte com mais serviços para expandir suas análises
              </CardDescription>
              <Button variant="outline" className="mt-4">
                Explorar integrações
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 border-t border-border/60">
          <h4 className="text-sm font-medium">Chaves API</h4>
          
          <FormField
            control={form.control}
            name="googleCalendarApiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Calendar API Key</FormLabel>
                <FormControl>
                  <Input placeholder="Insira sua API Key" {...field} type="password" />
                </FormControl>
                <FormDescription>
                  Usada para sincronizar eventos do Google Calendar.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="linkedinToken"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn API Token</FormLabel>
                <FormControl>
                  <Input placeholder="Insira seu token" {...field} type="password" />
                </FormControl>
                <FormDescription>
                  Para importar dados de rede profissional.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Salvar chaves API</Button>
        </form>
      </Form>
    </div>
  );
}
