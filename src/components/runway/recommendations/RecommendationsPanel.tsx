
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Calendar, AlertTriangle, DollarSign, BarChart, Users } from "lucide-react";

interface RecommendationsPanelProps {
  runwayMonths: number;
  burnRate: number;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ 
  runwayMonths,
  burnRate
}) => {
  // Define recomendações baseadas no estado do runway
  const getRecommendations = () => {
    if (runwayMonths < 3) {
      // Runway crítico (menos de 3 meses)
      return [
        {
          icon: <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Situação crítica: Reduza despesas imediatamente",
          description: "Corte 30-40% das despesas não essenciais para estender seu runway por pelo menos 2 meses.",
          priority: "high"
        },
        {
          icon: <DollarSign className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Inicie captação de emergência",
          description: `Busque captação bridge de R$ ${formatCurrency(burnRate * 6)} para garantir sobrevivência por 6 meses adicionais.`,
          priority: "high"
        },
        {
          icon: <Users className="h-4 w-4 text-destructive shrink-0 mt-0.5" />,
          title: "Revise estrutura da equipe",
          description: "Considere reestruturação de time e possíveis reduções para preservar caixa.",
          priority: "high"
        }
      ];
    } else if (runwayMonths < 6) {
      // Runway preocupante (entre 3 e 6 meses)
      return [
        {
          icon: <TrendingDown className="h-4 w-4 text-warning shrink-0 mt-0.5" />,
          title: "Reduza despesas não essenciais",
          description: "Uma redução de 15-20% nas despesas de marketing e serviços externos pode estender seu runway em 1.5 meses.",
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
          description: "Foque em clientes com menor CAC e maior LTV para maximizar eficiência do capital.",
          priority: "medium"
        }
      ];
    } else {
      // Runway saudável (6+ meses)
      return [
        {
          icon: <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />,
          title: "Invista em crescimento sustentável",
          description: "Com runway saudável, considere reinvestir 20-30% em canais de aquisição que provaram ROI positivo.",
          priority: "low"
        },
        {
          icon: <Calendar className="h-4 w-4 text-primary shrink-0 mt-0.5" />,
          title: "Planeje captação estratégica",
          description: "Aproveite a posição de força para negociar melhores termos com investidores nos próximos 3-4 meses.",
          priority: "low"
        },
        {
          icon: <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />,
          title: "Diversifique fontes de receita",
          description: "Explore novas linhas de produtos ou serviços para reduzir dependência de fonte única de receita.",
          priority: "low"
        }
      ];
    }
  };

  const recommendations = getRecommendations();

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
        <CardTitle>Recomendações do IA Advisor</CardTitle>
        <CardDescription>
          Sugestões para otimizar seu runway e finanças
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${
                recommendation.priority === "high" 
                  ? "bg-destructive/10 border-destructive/30" 
                  : recommendation.priority === "medium"
                  ? "bg-warning/10 border-warning/30"
                  : "bg-accent/50"
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
