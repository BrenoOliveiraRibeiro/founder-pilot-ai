
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";

export const useDashboardEffects = () => {
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const { metrics } = useOpenFinanceDashboard();

  useEffect(() => {
    // Welcome toast na primeira visita
    const hasVisitedDashboard = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisitedDashboard) {
      setTimeout(() => {
        toast({
          title: "Bem-vindo ao FounderPilot AI",
          description: "Seu copiloto estratégico para tomada de decisões de negócios com dados financeiros conectados.",
          className: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
          duration: 5000,
        });
        localStorage.setItem('hasVisitedDashboard', 'true');
      }, 2500);
    }
    
    // Alerta de runway crítico baseado em dados conectados
    if (metrics?.alertaCritico) {
      setTimeout(() => {
        toast({
          title: "ALERTA: Runway Crítico",
          description: `Seu runway atual é de apenas ${metrics.runwayMeses.toFixed(1)} meses baseado nos dados das suas contas conectadas. Acesse a seção de Finanças para mais detalhes.`,
          variant: "destructive",
          duration: 8000,
        });
      }, 3000);
    }
  }, [toast, metrics?.alertaCritico, metrics?.runwayMeses]);
};
