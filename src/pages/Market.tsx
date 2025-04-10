import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart, PieChart } from "recharts";
import { BarChart3, TrendingUp, GraduationCap, Building2, Target } from "lucide-react";
import { MarketSizeAnalysis } from "@/components/market/MarketSizeAnalysis";

// Dados de exemplo
const fundingData = [
  { name: 'Jan', value: 2.4 },
  { name: 'Fev', value: 3.8 },
  { name: 'Mar', value: 5.2 },
  { name: 'Abr', value: 3.9 },
  { name: 'Mai', value: 4.5 },
  { name: 'Jun', value: 6.1 },
];

const sectorsData = [
  { name: 'Fintech', value: 38 },
  { name: 'E-commerce', value: 24 },
  { name: 'SaaS', value: 18 },
  { name: 'Healthtech', value: 12 },
  { name: 'Edtech', value: 8 },
];

const competitorData = [
  { name: 'Empresa A', revenue: 12, funding: 24, valuation: 120 },
  { name: 'Empresa B', revenue: 8, funding: 16, valuation: 80 },
  { name: 'Empresa C', revenue: 16, funding: 32, valuation: 160 },
  { name: 'Sua Empresa', revenue: 6, funding: 10, valuation: 60 },
];

const MarketPage = () => {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dados de Mercado</h1>
          <p className="text-muted-foreground">
            Análise de mercado e benchmarks da indústria
          </p>
        </div>
      </div>

      <Tabs defaultValue="funding">
        <TabsList className="mb-4">
          <TabsTrigger value="funding">Captações</TabsTrigger>
          <TabsTrigger value="sectors">Setores</TabsTrigger>
          <TabsTrigger value="competitors">Competidores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="funding">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Tendências de Captação</CardTitle>
                </div>
                <CardDescription>Volumes de investimento nos últimos 6 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <LineChart width={500} height={300} data={fundingData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    {/* <CartesianGrid stroke="#eee" strokeDasharray="5 5" /> */}
                    {/* <Tooltip /> */}
                    {/* <Legend /> */}
                    {/* <Line type="monotone" dataKey="value" stroke="#8884d8" /> */}
                  </LineChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rodadas Recentes</CardTitle>
                <CardDescription>Investimentos mais recentes no seu setor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { company: "Fintech XYZ", amount: "R$35M", date: "1 semana atrás", stage: "Série B" },
                    { company: "SaaS Solutions", amount: "R$12M", date: "2 semanas atrás", stage: "Série A" },
                    { company: "E-commerce Pro", amount: "R$8M", date: "1 mês atrás", stage: "Seed" },
                    { company: "AI Analytics", amount: "R$22M", date: "1 mês atrás", stage: "Série A" }
                  ].map((deal, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{deal.company}</h3>
                        <span className="font-semibold text-sm">{deal.amount}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">{deal.date}</span>
                        <span className="text-sm bg-primary/10 text-primary px-2 rounded-full">{deal.stage}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sectors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle>Distribuição por Setor</CardTitle>
                </div>
                <CardDescription>Investimentos por setor nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 w-full">
                  <PieChart width={400} height={300}>
                    <Pie
                      data={sectorsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    />
                    {/* <Tooltip /> */}
                    {/* <Legend /> */}
                  </PieChart>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destaques por Setor</CardTitle>
                <CardDescription>Métricas e valuation médios por setor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { sector: "Fintech", valuation: "35x Receita", growth: "+45%", companies: 124 },
                    { sector: "SaaS", valuation: "18x Receita", growth: "+32%", companies: 98 },
                    { sector: "E-commerce", valuation: "12x Receita", growth: "+28%", companies: 152 },
                    { sector: "Healthtech", valuation: "22x Receita", growth: "+38%", companies: 87 }
                  ].map((sector, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-card">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{sector.sector}</h3>
                        <span className="text-sm bg-primary/10 text-primary px-2 rounded-full">{sector.growth}</span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-sm text-muted-foreground">Valuation médio: {sector.valuation}</span>
                        <span className="text-sm text-muted-foreground">{sector.companies} empresas</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors">
          <MarketSizeAnalysis />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default MarketPage;
