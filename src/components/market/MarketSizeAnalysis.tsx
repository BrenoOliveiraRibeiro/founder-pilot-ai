
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartLegend } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Target, Building2, GraduationCap, Sparkles, RefreshCw, Globe, TrendingUp, Lock, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Formatador para valores monetários grandes
const formatCurrency = (value: number) => {
  if (value >= 1000000000) {
    return `R$${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `R$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `R$${(value / 1000).toFixed(1)}K`;
  } else {
    return `R$${value.toFixed(0)}`;
  }
};

export const MarketSizeAnalysis = () => {
  const [segment, setSegment] = useState('');
  const [region, setRegion] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [aiEnriched, setAiEnriched] = useState(false);
  const [rawAiData, setRawAiData] = useState<string | null>(null);
  const [tamSamSomData, setTamSamSomData] = useState<any[]>([]);
  const [competitorsData, setCompetitorsData] = useState<any[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [growthProjection, setGrowthProjection] = useState<string>('');
  const [entryBarriers, setEntryBarriers] = useState<string[]>([]);
  const [empresaData, setEmpresaData] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('overview');
  
  const { toast } = useToast();

  // Buscar dados da empresa ao carregar o componente
  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: empresas, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Erro ao buscar dados da empresa:", error);
            return;
          }
          
          if (empresas) {
            setEmpresaData(empresas);
            
            // Preencher campos com dados da empresa
            if (empresas.segmento) setSegment(empresas.segmento);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    
    fetchEmpresaData();
  }, []);

  const handleAnalyze = async () => {
    if (!segment) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o segmento de atuação",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Obter sessão atual para pegar o ID da empresa
      const { data: { session } } = await supabase.auth.getSession();
      let empresa_id = null;
      
      if (session?.user) {
        const { data: empresas } = await supabase
          .from('empresas')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();
          
        if (empresas) {
          empresa_id = empresas.id;
        }
      }
      
      // Chamada para Edge Function
      const { data: result, error } = await supabase.functions.invoke('market-data', {
        body: { 
          action: 'analyze_market_size',
          segment,
          region,
          customerType,
          empresa_id
        }
      });
      
      if (error) {
        console.error("Erro ao analisar mercado:", error);
        toast({
          title: "Erro na análise",
          description: "Não foi possível concluir a análise de mercado.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      if (result && result.data) {
        const { tam, sam, som, competitors, insights: marketInsights, growth_projection, entry_barriers } = result.data;
        
        // Formatar dados para o gráfico de TAM/SAM/SOM
        const chartData = [
          { name: 'TAM', value: tam.value, color: '#0ea5e9', description: tam.description },
          { name: 'SAM', value: sam.value, color: '#14b8a6', description: sam.description },
          { name: 'SOM', value: som.value, color: '#8b5cf6', description: som.description }
        ];
        
        setTamSamSomData(chartData);
        setCompetitorsData(competitors);
        setInsights(marketInsights);
        setGrowthProjection(growth_projection || '28%');
        setEntryBarriers(entry_barriers || []);
        setAiEnriched(result.ai_enriched || false);
        setRawAiData(result.raw_ai_data || null);
        
        setHasAnalysis(true);
        toast({
          title: "Análise concluída",
          description: "Dados de mercado analisados com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao processar análise:", error);
      toast({
        title: "Erro na análise",
        description: "Ocorreu um erro ao processar os dados de mercado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setHasAnalysis(false);
    setTamSamSomData([]);
    setCompetitorsData([]);
    setInsights([]);
    setGrowthProjection('');
    setEntryBarriers([]);
    setRawAiData(null);
    setAiEnriched(false);
    setCurrentTab('overview');
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded-md shadow-md">
          <p className="font-medium">{data.name}: {formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </div>
      );
    }
    return null;
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
            {empresaData && (
              <span className="ml-1 text-primary">
                (enriquecido com dados da sua empresa)
              </span>
            )}
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
                    <Globe className="h-4 w-4 text-green-500" />
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
            <div className="space-y-4">
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="competitors">Competidores</TabsTrigger>
                  <TabsTrigger value="insights">Insights Estratégicos</TabsTrigger>
                  {rawAiData && (
                    <TabsTrigger value="raw">Análise Detalhada</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80">
                      <h3 className="text-sm font-medium mb-2 text-center">Tamanho Estimado do Mercado</h3>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tamSamSomData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={140}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                          >
                            {tamSamSomData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                          <ChartLegend content={
                            <div className="flex justify-center gap-4 mt-4">
                              {tamSamSomData.map((entry, index) => (
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
                        {aiEnriched && " + AI"}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-muted/50 rounded-lg p-4 border">
                        <h3 className="font-medium flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-amber-500" />
                          Insight Estratégico Principal
                        </h3>
                        <p className="text-sm">
                          {insights[0] || 
                            `Seu SOM representa ${formatCurrency(tamSamSomData[2]?.value || 0)} em potencial inexplorado no setor de ${segment || 'tecnologia'}. 
                            Concorrentes como ${competitorsData[0]?.name || 'líderes de mercado'} estão capturando apenas ${competitorsData[0]?.market_share || 20}% do mercado endereçável.`
                          }
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-muted/30 rounded-lg p-4 border">
                          <h3 className="font-medium flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Projeção de Crescimento
                          </h3>
                          <p className="text-xl font-semibold text-center my-3">{growthProjection}</p>
                          <p className="text-xs text-center text-muted-foreground">para os próximos 3 anos</p>
                        </div>
                        
                        <div className="bg-muted/30 rounded-lg p-4 border">
                          <h3 className="font-medium flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-red-500" />
                            Principais Barreiras
                          </h3>
                          <ul className="text-xs space-y-1">
                            {entryBarriers.slice(0, 3).map((barrier, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-primary">•</span>
                                <span>{barrier}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                        <h3 className="font-medium flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Oportunidade de Mercado
                        </h3>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-muted-foreground">TAM</p>
                            <p className="font-semibold">{formatCurrency(tamSamSomData[0]?.value || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">SAM</p>
                            <p className="font-semibold">{formatCurrency(tamSamSomData[1]?.value || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">SOM</p>
                            <p className="font-semibold">{formatCurrency(tamSamSomData[2]?.value || 0)}</p>
                          </div>
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
                </TabsContent>
                
                <TabsContent value="competitors" className="space-y-4">
                  <div className="mb-4">
                    <h3 className="font-medium text-lg mb-3">Principais Players no Mercado</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {competitorsData.map((competitor, index) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-lg border bg-card"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">
                              {competitor.name}
                            </h4>
                            <span className="text-sm bg-muted px-2 py-0.5 rounded-full">
                              {competitor.target}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Market share:</span>
                                <span className="font-medium">{competitor.market_share}%</span>
                              </div>
                              <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${competitor.market_share}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex justify-between mt-2">
                              <span className="text-sm text-muted-foreground">Valuation estimado:</span>
                              <span className="text-sm font-semibold">{competitor.valuation}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-primary">
                            Sua Empresa (Potencial)
                          </h4>
                          <span className="text-sm bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            {customerType || "B2B"}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Market share alvo:</span>
                              <span className="font-medium">5-10%</span>
                            </div>
                            <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ width: `7%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between mt-2">
                            <span className="text-sm text-muted-foreground">SOM em 3-5 anos:</span>
                            <span className="text-sm font-semibold">{formatCurrency(tamSamSomData[2]?.value || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-2">Estratégias comuns no setor</h3>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Diferenciação por meio de tecnologia proprietária e inovação constante</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Foco em nichos específicos para maximizar penetração e minimizar CAC</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>Parcerias estratégicas para expansão do alcance e redução de custos</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <h3 className="font-medium mb-2">Métricas-chave observadas</h3>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 text-sm">
                          <span className="text-muted-foreground">CAC médio:</span>
                          <span className="font-medium">R$750-1.500</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="text-muted-foreground">LTV médio:</span>
                          <span className="font-medium">R$4.500-9.000</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="text-muted-foreground">Razão LTV:CAC:</span>
                          <span className="font-medium">6:1</span>
                        </div>
                        <div className="grid grid-cols-2 text-sm">
                          <span className="text-muted-foreground">Churn anual:</span>
                          <span className="font-medium">15-25%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="insights" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {insights.map((insight, index) => (
                      <Card key={index} className={index === 0 ? "lg:col-span-3 bg-primary/5 border-primary/20" : ""}>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            {index === 0 ? "Insight Principal" : `Insight ${index + 1}`}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className={index === 0 ? "text-base" : "text-sm"}>
                            {insight}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Tendências de Crescimento
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Crescimento projetado:</span>
                            <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {growthProjection}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            O setor de {segment || "tecnologia"} tem mostrado um crescimento consistente 
                            nos últimos anos, impulsionado por {customerType === "B2B" ? "transformação digital nas empresas" : 
                            customerType === "B2C" ? "novas demandas dos consumidores" : 
                            "adoção de novas tecnologias"}.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Lock className="h-4 w-4 text-red-500" />
                          Barreiras de Entrada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          {entryBarriers.map((barrier, index) => (
                            <li key={index} className="text-sm flex items-start gap-1.5">
                              <span className="text-primary">•</span>
                              <span>{barrier}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          Oportunidades Estratégicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1.5">
                          <li className="text-sm flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Foco em nichos pouco explorados por grandes players</span>
                          </li>
                          <li className="text-sm flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Desenvolvimento de soluções específicas para {customerType || "B2B"}</span>
                          </li>
                          <li className="text-sm flex items-start gap-1.5">
                            <span className="text-primary">•</span>
                            <span>Parcerias estratégicas para reduzir barreiras de entrada</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {rawAiData && (
                  <TabsContent value="raw" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-amber-500" />
                          Análise Detalhada com IA
                        </CardTitle>
                        <CardDescription>
                          Esta análise foi gerada com base nos dados disponíveis sobre o mercado de {segment || "tecnologia"}
                          {region ? ` na região de ${region}` : ""} para clientes {customerType || "B2B"}.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea 
                          className="min-h-[300px] font-mono text-sm"
                          value={rawAiData}
                          readOnly
                        />
                      </CardContent>
                      <CardFooter className="text-xs text-muted-foreground">
                        Fontes: Combinação de dados de mercado e análise avançada com IA.
                      </CardFooter>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
