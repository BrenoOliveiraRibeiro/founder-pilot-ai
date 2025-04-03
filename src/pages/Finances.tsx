
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CalendarIcon, DollarSign, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { LineChart } from "recharts";

// Dados de exemplo
const cashFlowData = [
  { month: 'Jan', entrada: 120000, saida: 90000 },
  { month: 'Fev', entrada: 130000, saida: 85000 },
  { month: 'Mar', entrada: 125000, saida: 95000 },
  { month: 'Abr', entrada: 140000, saida: 100000 },
  { month: 'Mai', entrada: 150000, saida: 110000 },
  { month: 'Jun', entrada: 160000, saida: 125000 },
];

const FinancesPage = () => {
  const [date, setDate] = useState<Date>(new Date());
  const runway = 4.2; // em meses

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saúde Financeira</h1>
          <p className="text-muted-foreground">
            Análise da saúde financeira da sua empresa
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
          <Button>Conectar contas</Button>
        </div>
      </div>

      {runway < 6 && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção! Runway abaixo do recomendado</AlertTitle>
          <AlertDescription>
            Seu runway atual é de {runway.toFixed(1)} meses. Recomendamos ter pelo menos 6 meses de runway para segurança.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo em Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(420000)}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Atualizado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Entradas (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(160000)}</div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-green-500 font-medium">+12.5%</span>
              <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saídas (Mês Atual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(125000)}</div>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-red-500 font-medium">+13.6%</span>
              <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="expenses">Despesas</TabsTrigger>
          <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Runway</CardTitle>
                <CardDescription>
                  Com base no burn rate atual, seu dinheiro dura:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6">
                  <div className={`text-5xl font-bold mb-2 ${runway < 3 ? 'text-red-500' : runway < 6 ? 'text-warning' : 'text-green-500'}`}>
                    {runway.toFixed(1)} meses
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    Burn rate mensal médio: {formatCurrency(100000)}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                    <div 
                      className={`h-2.5 rounded-full ${runway < 3 ? 'bg-red-500' : runway < 6 ? 'bg-warning' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(runway / 12 * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Meta recomendada: 12+ meses
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Saúde Financeira</CardTitle>
                <CardDescription>Indicadores de saúde financeira da empresa</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Margem Bruta", value: "54%", status: "good", target: ">50%" },
                    { title: "Margem Líquida", value: "15%", status: "warning", target: ">20%" },
                    { title: "Eficiência de Capital", value: "1.8x", status: "good", target: ">1.5x" },
                    { title: "Burn Multiple", value: "2.1x", status: "warning", target: "<1.5x" }
                  ].map((metric, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        metric.status === 'good' ? 'bg-green-500' : 
                        metric.status === 'warning' ? 'bg-warning' : 'bg-red-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{metric.title}</span>
                          <span className="font-bold">{metric.value}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span>Meta: {metric.target}</span>
                          <span>{metric.status === 'good' ? 'Bom' : metric.status === 'warning' ? 'Atenção' : 'Crítico'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Entradas e saídas dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full mb-6">
                <LineChart width={800} height={300} data={cashFlowData}>
                  {/* Implementação completa do gráfico */}
                </LineChart>
              </div>
              
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3">Mês</th>
                      <th className="text-right p-3">Entradas</th>
                      <th className="text-right p-3">Saídas</th>
                      <th className="text-right p-3">Resultado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashFlowData.map((month, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3 font-medium">{month.month}</td>
                        <td className="p-3 text-right text-green-500">{formatCurrency(month.entrada)}</td>
                        <td className="p-3 text-right text-red-500">{formatCurrency(month.saida)}</td>
                        <td className="p-3 text-right font-medium">
                          {formatCurrency(month.entrada - month.saida)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Despesas</CardTitle>
              <CardDescription>Detalhamento das principais categorias de despesas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { category: "Pessoal", amount: 75000, percentage: 60 },
                  { category: "Marketing", amount: 25000, percentage: 20 },
                  { category: "Infraestrutura", amount: 12500, percentage: 10 },
                  { category: "Software", amount: 7500, percentage: 6 },
                  { category: "Outros", amount: 5000, percentage: 4 }
                ].map((expense, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{expense.category}</span>
                      <span>{formatCurrency(expense.amount)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5 mb-1">
                      <div 
                        className="h-2.5 rounded-full bg-primary"
                        style={{ width: `${expense.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {expense.percentage}% do total
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Contas Bancárias Conectadas</CardTitle>
              <CardDescription>Saldos atuais das contas bancárias integradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { bank: "Nubank", account: "Conta PJ", balance: 285000, lastUpdate: new Date() },
                  { bank: "BTG Pactual", account: "Conta Investimentos", balance: 135000, lastUpdate: new Date() }
                ].map((account, index) => (
                  <div key={index} className="p-4 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{account.bank}</h3>
                        <p className="text-sm text-muted-foreground">{account.account}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(account.balance)}</div>
                        <p className="text-xs text-muted-foreground">
                          Atualizado em {format(account.lastUpdate, "dd/MM/yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border border-dashed rounded-lg p-6 text-center">
                  <h3 className="font-medium mb-2">Conecte mais contas bancárias</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Integramos com todas as principais instituições financeiras do Brasil
                  </p>
                  <Button>Conectar Nova Conta</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default FinancesPage;
