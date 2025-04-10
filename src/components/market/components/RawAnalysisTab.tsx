
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface RawAnalysisTabProps {
  rawAiData: string | null;
  segment: string;
  region: string;
  customerType: string;
}

export const RawAnalysisTab: React.FC<RawAnalysisTabProps> = ({
  rawAiData,
  segment,
  region,
  customerType
}) => {
  return (
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
          value={rawAiData || ""}
          readOnly
        />
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Fontes: Combinação de dados de mercado e análise avançada com IA.
      </CardFooter>
    </Card>
  );
};
