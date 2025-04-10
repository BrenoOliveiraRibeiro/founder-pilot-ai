
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Calendar } from "lucide-react";

export const RecommendationsPanel: React.FC = () => {
  return (
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
  );
};
