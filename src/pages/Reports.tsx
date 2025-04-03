
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Download, FileText } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const ReportsPage = () => {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Relatórios financeiros e métricas de negócio
          </p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(date, "MMMM yyyy")}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <Button variant="default" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financial">
        <TabsList className="mb-4">
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="custom">Personalizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financial">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle>Demonstração de Resultados</CardTitle>
                </div>
                <CardDescription>Relatório financeiro de {format(date, "MMMM yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Item</th>
                        <th className="text-right p-3">Valor (R$)</th>
                        <th className="text-right p-3">% Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Receita Total</td>
                        <td className="p-3 text-right">125.000,00</td>
                        <td className="p-3 text-right">100,0%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">(-) Impostos</td>
                        <td className="p-3 text-right">15.000,00</td>
                        <td className="p-3 text-right">12,0%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">(-) Custos Operacionais</td>
                        <td className="p-3 text-right">42.500,00</td>
                        <td className="p-3 text-right">34,0%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">(=) Lucro Bruto</td>
                        <td className="p-3 text-right font-medium">67.500,00</td>
                        <td className="p-3 text-right font-medium">54,0%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">(-) Despesas Administrativas</td>
                        <td className="p-3 text-right">18.750,00</td>
                        <td className="p-3 text-right">15,0%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">(-) Despesas Marketing</td>
                        <td className="p-3 text-right">25.000,00</td>
                        <td className="p-3 text-right">20,0%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">(=) EBITDA</td>
                        <td className="p-3 text-right font-medium">23.750,00</td>
                        <td className="p-3 text-right font-medium">19,0%</td>
                      </tr>
                      <tr className="bg-muted/50 font-medium">
                        <td className="p-3">Resultado Líquido</td>
                        <td className="p-3 text-right">18.750,00</td>
                        <td className="p-3 text-right">15,0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>KPIs de Negócio</CardTitle>
                <CardDescription>Principais indicadores de desempenho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { title: "CAC", value: "R$ 850", change: "-5%", status: "positive" },
                    { title: "LTV", value: "R$ 4.250", change: "+12%", status: "positive" },
                    { title: "LTV/CAC", value: "5.0", change: "+18%", status: "positive" }
                  ].map((metric, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-accent/50">
                      <p className="text-sm font-medium mb-1">{metric.title}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <span className={`text-sm ${metric.status === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3">Métrica</th>
                        <th className="text-right p-3">Atual</th>
                        <th className="text-right p-3">Mês Anterior</th>
                        <th className="text-right p-3">Variação</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3 font-medium">MRR</td>
                        <td className="p-3 text-right">R$ 125.000</td>
                        <td className="p-3 text-right">R$ 115.000</td>
                        <td className="p-3 text-right text-green-500">+8,7%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Taxa de retenção</td>
                        <td className="p-3 text-right">95,2%</td>
                        <td className="p-3 text-right">93,8%</td>
                        <td className="p-3 text-right text-green-500">+1,5%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Taxa de conversão</td>
                        <td className="p-3 text-right">3,8%</td>
                        <td className="p-3 text-right">3,5%</td>
                        <td className="p-3 text-right text-green-500">+8,6%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Usuários ativos</td>
                        <td className="p-3 text-right">4.850</td>
                        <td className="p-3 text-right">4.520</td>
                        <td className="p-3 text-right text-green-500">+7,3%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3 font-medium">Churn rate</td>
                        <td className="p-3 text-right">1,8%</td>
                        <td className="p-3 text-right">2,2%</td>
                        <td className="p-3 text-right text-green-500">-18,2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Personalizados</CardTitle>
              <CardDescription>Crie relatórios customizados para suas necessidades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-8 text-center">
                <div className="mb-4">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-medium mb-2">Crie seu primeiro relatório personalizado</h3>
                <p className="text-muted-foreground mb-4">
                  Combine métricas e visualizações para criar relatórios sob medida para sua startup
                </p>
                <Button>Criar Relatório</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default ReportsPage;
