
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, Lock, Target } from "lucide-react";

interface InsightsTabProps {
  insights: string[];
  growthProjection: string;
  entryBarriers: string[];
  segment: string;
  customerType: string;
}

export const InsightsTab: React.FC<InsightsTabProps> = ({
  insights,
  growthProjection,
  entryBarriers,
  segment,
  customerType
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};
