
import React from "react";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, TrendingUp, ArrowRight, Calendar } from "lucide-react";
import { formatCurrency } from "../utils/formatters";

interface FinancialRecommendationsProps {
  tamSamSomData: any[];
  growthProjection: string;
  segment: string;
}

export const FinancialRecommendations: React.FC<FinancialRecommendationsProps> = ({
  tamSamSomData,
  growthProjection,
  segment
}) => {
  const { currentEmpresa } = useAuth();
  const { activeIntegrations } = useOpenFinanceConnections();
  const { metrics, loading } = useFinanceData(currentEmpresa?.id || null);
  
  const hasFinanceData = activeIntegrations.length > 0 && metrics;
  
  if (!hasFinanceData) return null;
  
  // Extração de dados-chave
  const caixaAtual = metrics?.caixa_atual || 0;
  const burnRate = metrics?.burn_rate || 0;
  const runwayMeses = metrics?.runway_meses || 0;
  const receitaMensal = metrics?.receita_mensal || 0;
  const somValue = tamSamSomData[2]?.value || 0;
  
  // Parsing do growth projection para número (removendo % e convertendo para decimal)
  const marketGrowthRate = parseFloat(growthProjection.replace('%', '')) / 100;
  
  // Cálculo de quanto capital seria necessário para crescer na mesma taxa do mercado
  const capitalNeededForGrowth = receitaMensal * marketGrowthRate * 12; // Multiplicado por 12 para ano
  
  // Comparar o burn rate atual com o capital necessário
  const burnRateAdequate = burnRate < capitalNeededForGrowth * 0.75;
  
  // Calcular captação recomendada (caso necessário)
  let captacaoRecomendada = 0;
  if (runwayMeses < 12) {
    // Recurso necessário para 18 meses de runway mais investimento em crescimento
    captacaoRecomendada = (burnRate * (18 - runwayMeses)) + capitalNeededForGrowth;
  }
  
  // Recomendação de alocação de capital para crescimento (baseado na oportunidade de mercado)
  const alocacaoMarketing = capitalNeededForGrowth * 0.4; // 40% em marketing
  const alocacaoDesenvolvimento = capitalNeededForGrowth * 0.35; // 35% em produto
  const alocacaoVendas = capitalNeededForGrowth * 0.25; // 25% em vendas

  return (
    <Card className="mt-4 bg-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Recomendações Estratégicas Personalizadas
        </h3>
        
        <div className="space-y-3">
          {runwayMeses < 12 && (
            <div className="p-3 rounded-md bg-white border">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Planejamento de Captação para o Mercado</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Com base no seu runway atual de {runwayMeses.toFixed(1)} meses e na oportunidade de mercado 
                    de {formatCurrency(somValue)}, recomendamos uma captação de aproximadamente 
                    <span className="font-medium text-primary"> {formatCurrency(captacaoRecomendada)}</span> para 
                    garantir 18 meses de operação e investir no crescimento necessário para competir no setor de {segment}.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="p-3 rounded-md bg-white border">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Alocação de Capital para Crescimento</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Para aproveitar a projeção de crescimento de {growthProjection} do mercado, recomendamos 
                  alocar aproximadamente {formatCurrency(capitalNeededForGrowth)} em investimentos estratégicos:
                </p>
                <ul className="text-xs list-disc ml-5 mt-2 space-y-1">
                  <li>Marketing e Aquisição: <span className="font-medium">{formatCurrency(alocacaoMarketing)}</span></li>
                  <li>Desenvolvimento de Produto: <span className="font-medium">{formatCurrency(alocacaoDesenvolvimento)}</span></li>
                  <li>Equipe de Vendas: <span className="font-medium">{formatCurrency(alocacaoVendas)}</span></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="p-3 rounded-md bg-white border">
            <div className="flex items-start gap-2">
              <ArrowRight className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">Burn Rate vs. Oportunidade de Mercado</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {burnRateAdequate ? (
                    <>Seu burn rate atual de {formatCurrency(burnRate)} está bem dimensionado para 
                    capitalizar a oportunidade de mercado identificada. Continue monitorando a eficiência 
                    do capital (CAC, LTV) para maximizar o retorno.</>
                  ) : (
                    <>Seu burn rate atual de {formatCurrency(burnRate)} está 
                    <span className="text-warning font-medium"> acima do ideal</span> considerando sua receita e 
                    a oportunidade de mercado. Recomendamos avaliar a eficiência de alocação de recursos para 
                    maximizar crescimento e runway.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
