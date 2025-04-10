
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Target, Building2, GraduationCap, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Mock data para o gráfico TAM/SAM/SOM
const mockTamSamSomData = [
  { name: 'TAM', value: 15000000000, color: '#0ea5e9' },
  { name: 'SAM', value: 3000000000, color: '#14b8a6' },
  { name: 'SOM', value: 450000000, color: '#8b5cf6' }
];

// Mock data para competidores
const mockCompetitors = [
  { name: 'Empresa A', market_share: 18, valuation: 'R$450M', target: 'Enterprise' },
  { name: 'Empresa B', market_share: 12, valuation: 'R$320M', target: 'PME' },
  { name: 'Empresa C', market_share: 8, valuation: 'R$180M', target: 'B2B' },
  { name: 'Sua Empresa', market_share: 3, valuation: 'R$60M', target: 'B2B', highlight: true }
];

export const MarketSizeAnalysis = () => {
  const [segment, setSegment] = useState('');
  const [region, setRegion] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const { toast } = useToast();

  // Formatador para valores monetários grandes
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `R$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `R$${(value / 1000000).toFixed(1)}M`;
    } else {
      return `R$${(value / 1000).toFixed(1)}K`;
    }
  };

  const handleAnalyze = () => {
    if (!segment) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o segmento de atuação",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulando chamada para API/Edge Function
    setTimeout(() => {
      setIsLoading(false);
      setHasAnalysis(true);
      toast({
        title: "Análise concluída",
        description: "Dados de mercado analisados com sucesso!",
      });
    }, 1500);
  };

  const resetAnalysis = () => {
    setHasAnalysis(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Análise de Mercado com IA (TAM, SAM e SOM)</CardTitle>
            </div>
            {hasAnalysis && (
              <Button variant="outline" size="sm" onClick={resetAnalysis}>
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                Nova Análise
              </Button>
            )}
          </div>
          <CardDescription>
            Estimativa do tamanho de mercado e oportunidade de negócio com base em dados de mercado e IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasAnalysis ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="segment" className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Segmento de atuação
                  </Label>
                  <Input 
                    id="segment" 
                    placeholder="Ex: Fintech, Marketplace, SaaS B2B" 
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region" className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-green-500" />
                    Região geográfica
                  </Label>
                  <Input 
                    id="region" 
                    placeholder="Ex: Brasil, América Latina, SP Capital" 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerType" className="flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-purple-500" />
                    Tipo de cliente
                  </Label>
                  <Select 
                    value={customerType} 
                    onValueChange={setCustomerType}
                  >
                    <SelectTrigger id="customerType">
                      <SelectValue placeholder="Selecione o tipo de cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="B2B">B2B</SelectItem>
                      <SelectItem value="B2C">B2C</SelectItem>
                      <SelectItem value="PME">PME</SelectItem>
                      <SelectItem value="Enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleAnalyze} 
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
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <h3 className="text-sm font-medium mb-2 text-center">Tamanho Estimado do Mercado</h3>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mockTamSamSomData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={140}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {mockTamSamSomData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <ChartLegend content={
                        <div className="flex justify-center gap-4 mt-4">
                          {mockTamSamSomData.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: entry.color }}
                              />
                              <span className="text-sm">{entry.name}</span>
                            </div>
                          ))}
                        </div>
                      } />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Fontes: Crunchbase, PitchBook, CB Insights, Statista
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <h3 className="font-medium flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Insight Estratégico
                    </h3>
                    <p className="text-sm">
                      Seu SOM representa R$450 milhões em potencial inexplorado no setor de {segment || 'tecnologia'}. 
                      Concorrentes como Empresa A estão capturando apenas 18% do mercado endereçável. 
                      Há espaço significativo para crescer com CAC estimado de R$750 por cliente.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Principais Players no Mercado</h3>
                    <div className="space-y-3">
                      {mockCompetitors.map((competitor, index) => (
                        <div 
                          key={index} 
                          className={`p-3 rounded-lg border ${competitor.highlight ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}
                        >
                          <div className="flex justify-between">
                            <h4 className={`font-medium ${competitor.highlight ? 'text-primary' : ''}`}>
                              {competitor.name}
                              {competitor.highlight && " (Você)"}
                            </h4>
                            <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                              {competitor.target}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-muted-foreground">
                              Market share: {competitor.market_share}%
                            </span>
                            <span className="text-sm font-medium">
                              {competitor.valuation}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 border border-dashed">
                <h3 className="text-sm font-medium mb-2">Glossário</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-blue-500">TAM (Total Addressable Market):</span> 
                    <p className="text-muted-foreground">Representa o mercado total disponível para seu produto/serviço.</p>
                  </div>
                  <div>
                    <span className="font-semibold text-teal-500">SAM (Serviceable Addressable Market):</span> 
                    <p className="text-muted-foreground">Parcela do TAM que seus produtos e serviços podem atender.</p>
                  </div>
                  <div>
                    <span className="font-semibold text-purple-500">SOM (Serviceable Obtainable Market):</span> 
                    <p className="text-muted-foreground">Parcela do SAM que você pode capturar de forma realista.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
