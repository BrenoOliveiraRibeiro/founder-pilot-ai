
import React from "react";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, BarChart2 } from "lucide-react";
import { Insight } from "@/integrations/supabase/models";

export const getStatusFromType = (tipo: string) => {
  switch (tipo) {
    case "alerta": return "danger";
    case "sugestão": return "info";
    case "projeção": return "info";
    default: return "info";
  }
};

export const getStatusFromPriority = (prioridade: string) => {
  switch (prioridade) {
    case "alta": return "danger";
    case "media": return "warning";
    case "baixa": return "success";
    default: return "info";
  }
};

export const getIconFromType = (tipo: string) => {
  switch (tipo) {
    case "alerta": return <AlertTriangle className="h-4 w-4" />;
    case "sugestão": return <CheckCircle className="h-4 w-4" />;
    case "projeção":
      return Math.random() > 0.5 ? 
        <TrendingUp className="h-4 w-4" /> : 
        <TrendingDown className="h-4 w-4" />;
    default: return <BarChart2 className="h-4 w-4" />;
  }
};

export const getExampleInsights = (): Insight[] => {
  return [
    {
      id: "1",
      empresa_id: "",
      tipo: "alerta",
      titulo: "Seus gastos com engenharia são 30% maiores que startups similares",
      descricao: "",
      prioridade: "alta",
      status: "pendente",
      data_criacao: "",
      data_resolucao: null
    },
    {
      id: "2",
      empresa_id: "",
      tipo: "alerta",
      titulo: "Você pode precisar captar recursos nos próximos 3 meses com base no runway atual",
      descricao: "",
      prioridade: "media",
      status: "pendente",
      data_criacao: "",
      data_resolucao: null
    },
    {
      id: "3",
      empresa_id: "",
      tipo: "projeção",
      titulo: "O crescimento da receita é consistente com transições bem-sucedidas de Seed para Series A",
      descricao: "",
      prioridade: "baixa",
      status: "pendente",
      data_criacao: "",
      data_resolucao: null
    },
    {
      id: "4",
      empresa_id: "",
      tipo: "sugestão",
      titulo: "Sua margem bruta (68%) é melhor que a média do setor (55%)",
      descricao: "",
      prioridade: "baixa",
      status: "pendente",
      data_criacao: "",
      data_resolucao: null
    }
  ];
};
