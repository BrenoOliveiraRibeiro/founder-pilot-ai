
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Calendar, AlertTriangle, DollarSign, BarChart, Users, ShieldCheck, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecommendationsPanelProps {
  runwayMonths: number;
  burnRate: number;
  hasRealData?: boolean;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  runwayMonths,
  burnRate,
  hasRealData = false
}) => {
  // Define recomendações baseadas no estado do runway
  const getRecommendations = () => {
    if (runwayMonths < 3) {
      // Runway crítico (menos de 3 meses)
      return [
        {
          icon: <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Situação crítica: Reduza despesas imediatamente",
          description: hasRealData 
            ? "Com base nos seus dados reais, corte 30-40% das despesas não essenciais para estender seu runway por pelo menos 2 meses."
            : "Corte 30-40% das despesas não essenciais para estender seu runway por pelo menos 2 meses.",
          priority: "high"
        },
        {
          icon: <DollarSign className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Inicie captação de emergência",
          description: `Busque captação bridge de ${formatCurrency(burnRate * 6)} para garantir sobrevivência por 6 meses adicionais.`,
          priority: "high"
        },
        {
          icon: <Users className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Revise estrutura da equipe",
          description: hasRealData
            ? "Seus dados reais mostram necessidade urgente de reestruturação de time e possíveis reduções para preservar caixa."
            : "Considere reestruturação de time e possíveis reduções para preservar caixa.",
          priority: "high"
        }
      ];
    } else if (runwayMonths < 6) {
      // Runway preocupante (entre 3 e 6 meses)
      return [
        {
          icon: <TrendingDown className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Reduza despesas não essenciais",
          description: hasRealData
            ? "Baseado no seu burn rate real, uma redução de 15-20% nas despesas de marketing e serviços externos pode estender seu runway em 1.5 meses."
            : "Uma redução de 15-20% nas despesas de marketing e serviços externos pode estender seu runway em 1.5 meses.",
          priority: "medium"
        },
        {
          icon: <Calendar className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Planeje captação nos próximos 60 dias",
          description: "Comece a preparar documentação e pitch para investidores com antecedência.",
          priority: "medium"
        },
        {
          icon: <BarChart className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Otimize fontes de receita",
          description: hasRealData
            ? "Analisando seu fluxo de caixa real, foque em clientes com menor CAC e maior LTV para maximizar eficiência do capital."
            : "Foque em clientes com menor CAC e maior LTV para maximizar eficiência do capital.",
          priority: "medium"
        }
      ];
    } else {
      // Runway saudável (6+ meses)
      return [
        {
          icon: <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
          title: "Invista em crescimento sustentável",
          description: hasRealData
            ? "Com runway saudável confirmado pelos seus dados reais, considere reinvestir 20-30% em canais de aquisição que provaram ROI positivo."
            : "Com runway saudável, considere reinvestir 20-30% em canais de aquisição que provaram ROI positivo.",
          priority: "low"
        },
        {
          icon: <Calendar className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
          title: "Planeje captação estratégica",
          description: "Aproveite a posição de força para negociar melhores termos com investidores nos próximos 3-4 meses.",
          priority: "low"
        },
        {
          icon: <ShieldCheck className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />,
          title: "Solidifique estrutura financeira",
          description: hasRealData
            ? "Com base nos seus dados reais, desenvolva múltiplas fontes de receita e crie reservas para enfrentar possíveis cenários adversos."
            : "Desenvolva múltiplas fontes de receita e crie reservas para enfrentar possíveis cenários adversos.",
          priority: "low"
        }
      ];
    }
  };

  const recommendations = getRecommendations();

  // Função para formatar values
  const getStatusBadgeVariant = (priority: string) => {
    if (priority === "high") return "destructive";
    if (priority === "medium") return "warning";
    return "default";
  };
  
  // Função para formatação de valores monetários
  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  }

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            IA Advisor
            {hasRealData && (
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                Dados Reais
              </Badge>
            )}
          </CardTitle>
          <Badge variant={runwayMonths < 3 ? "destructive" : runwayMonths < 6 ? "warning" : "default"}>
            {runwayMonths < 3 ? 'Ação Urgente' : runwayMonths < 6 ? 'Atenção' : 'Oportunidade'}
          </Badge>
        </div>
        <CardDescription>
          {hasRealData 
            ? "Recomendações baseadas nos seus dados financeiros reais"
            : "Sugestões para otimizar seu runway e finanças"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border-2 transition-all ${
                recommendation.priority === "high" 
                  ? "bg-destructive/10 border-destructive/70" 
                  : recommendation.priority === "medium"
                  ? "bg-warning/10 border-warning/70"
                  : "bg-green-100/50 border-green-500/70 dark:bg-green-900/20 dark:border-green-700/50"
              }`}
            >
              <div className="flex items-start gap-2">
                {recommendation.icon}
                <div>
                  <h3 className="font-medium text-sm">{recommendation.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recommendation.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
