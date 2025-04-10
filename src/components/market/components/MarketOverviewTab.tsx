
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, ChartLegend } from "recharts";
import { Sparkles, TrendingUp, Lock, DollarSign } from "lucide-react";
import { CustomPieTooltip } from "./PieChartTooltip";
import { formatCurrency } from "../utils/formatters";

interface MarketOverviewTabProps {
  tamSamSomData: any[];
  insights: string[];
  growthProjection: string;
  entryBarriers: string[];
  competitorsData: any[];
  segment: string;
  aiEnriched: boolean;
}

export const MarketOverviewTab: React.FC<MarketOverviewTabProps> = ({
  tamSamSomData,
  insights,
  growthProjection,
  entryBarriers,
  competitorsData,
  segment,
  aiEnriched
}) => {
  return (
    <div className="space-y-6">
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
              <CustomPieTooltip />
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
    </div>
  );
};
