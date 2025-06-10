
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  BarChart2, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface InsightItemProps {
  icon: React.ReactNode;
  title: string;
  status: "success" | "warning" | "danger" | "info";
  index: number;
}

const InsightItem = ({ icon, title, status, index }: InsightItemProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "danger":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
      className={`p-3 rounded-md border ${getStatusClasses()} flex items-center gap-3`}
    >
      {icon}
      <p className="text-sm font-medium">{title}</p>
    </motion.div>
  );
};

export const InsightsCard = () => {
  const { currentEmpresa } = useAuth();
  const { loading, insights } = useFinanceData(currentEmpresa?.id || null);

  // Mapeamento de tipo para status visual
  const getStatusFromType = (tipo: string) => {
    switch (tipo) {
      case "alerta": return "danger";
      case "sugestão": return "info";
      case "projeção": return "info";
      default: return "info";
    }
  };

  // Mapeamento de prioridade para status visual
  const getStatusFromPriority = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "danger";
      case "media": return "warning";
      case "baixa": return "success";
      default: return "info";
    }
  };

  // Mapeamento de tipo para ícone
  const getIconFromType = (tipo: string) => {
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

  // Exemplo de insights para quando não há dados reais
  const exampleInsights = [
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

  const insightsToDisplay = insights.length > 0 ? insights : exampleInsights;

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <Card>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Insights Gerados por IA
          </CardTitle>
        </CardHeader>
      </motion.div>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-full h-14">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
              </Skeleton>
            ))}
          </div>
        ) : (
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {insightsToDisplay.map((insight, index) => (
              <InsightItem
                key={insight.id}
                index={index}
                icon={getIconFromType(insight.tipo)}
                title={insight.titulo}
                status={getStatusFromPriority(insight.prioridade)}
              />
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
