
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TrendingDown, AlertTriangle, Calendar, TrendingUp, Calculator } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { RunwaySimulator, SimulationResult } from "@/components/runway/RunwaySimulator";

// Dados de exemplo para o gráfico de projeção
const runwayProjectionData = [
  { month: "Abr", cash: 420000 },
  { month: "Mai", cash: 370000 },
  { month: "Jun", cash: 320000 },
  { month: "Jul", cash: 270000 },
  { month: "Ago", cash: 220000 },
  { month: "Set", cash: 170000 },
  { month: "Out", cash: 120000 },
  { month: "Nov", cash: 70000 },
  { month: "Dez", cash: 20000 },
  { month: "Jan", cash: -30000 },
];

const RunwayPage = () => {
  // Estado inicial
  const [cashReserve, setCashReserve] = useState(420000);
  const [burnRate, setBurnRate] = useState(100000);
  const [runwayMonths, setRunwayMonths] = useState(4.2);
  const [projectionData, setProjectionData] = useState(runwayProjectionData);
  
  // Estado para controle do modal de simulação
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Calcular a data estimada de esgotamento
  const estimatedRunoutDate = new Date();
  estimatedRunoutDate.setDate(estimatedRunoutDate.getDate() + Math.floor(runwayMonths * 30));

  // Função para aplicar os resultados da simulação
  const applySimulation = (result: SimulationResult) => {
    setCashReserve(result.cashReserve);
    setBurnRate(result.burnRate);
    setRunwayMonths(result.runwayMonths);
    
    // Criar novos dados de projeção com base nos valores simulados
    const newProjectionData = [];
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    let currentDate = new Date();
    let remainingCash = result.cashReserve;
    
    for (let i = 0; i < 10; i++) {
      const monthIndex = (currentDate.getMonth() + i) % 12;
      const month = monthNames[monthIndex];
      
      remainingCash -= result.burnRate;
      
      newProjectionData.push({
        month,
        cash: remainingCash,
      });
      
      if (remainingCash < 0) break;
    }
    
    setProjectionData(newProjectionData);
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análise de Runway</h1>
          <p className="text-muted-foreground">
            Previsões e análises sobre sua reserva financeira
          </p>
        </div>
        <Button onClick={() => setSimulatorOpen(true)} className="gap-2">
          <Calculator className="h-4 w-4" />
          Simular Cenários
        </Button>
      </div>

      {runwayMonths < 6 && (
        <Alert variant="warning" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção: Runway abaixo do recomendado</AlertTitle>
          <AlertDescription>
            Seu runway atual é de {runwayMonths.toFixed(1)} meses. Recomendamos ter pelo menos 6 meses 
            de runway para segurança financeira. Considere reduzir despesas ou buscar captação.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Runway Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
              <div className={`text-2xl font-bold ${runwayMonths < 3 ? 'text-red-500' : runwayMonths < 6 ? 'text-warning' : 'text-green-500'}`}>
                {runwayMonths.toFixed(1)} meses
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Caixa Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(cashReserve)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Burn Rate Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
              <div className="text-2xl font-bold">{formatCurrency(burnRate)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Previsão de Esgotamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className={`h-4 w-4 ${runwayMonths < 3 ? 'text-red-500' : 'text-warning'} mr-2`} />
              <div className="text-2xl font-bold">
                {estimatedRunoutDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Projeção de Caixa</CardTitle>
            <CardDescription>
              Previsão de caixa com base no burn rate atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${formatCurrency(value)}`}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <Tooltip 
                    formatter={(value) => [`${formatCurrency(Number(value))}`, 'Saldo']}
                    labelFormatter={(label) => `Mês: ${label}`}
                  />
                  <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                  <Line 
                    type="monotone" 
                    dataKey="cash" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Recomendações do IA Advisor</CardTitle>
            <CardDescription>
              Sugestões para melhorar seu runway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg border bg-accent/50">
                <div className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">Reduzir despesas de marketing</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Uma redução de 20% nas despesas de marketing estenderia seu runway em aprox. 1.2 meses.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-accent/50">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">Planejar captação estratégica</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Considere iniciar conversas para uma captação nos próximos 2 meses para evitar pressão financeira.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg border bg-accent/50">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">Revisar contratos de longo prazo</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Renegociar contratos de software e serviços pode reduzir custos fixos em até 15%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de simulação */}
      <RunwaySimulator 
        open={simulatorOpen}
        onOpenChange={setSimulatorOpen}
        initialData={{ cashReserve, burnRate, runwayMonths }}
        onSimulate={applySimulation}
      />
    </AppLayout>
  );
};

export default RunwayPage;
