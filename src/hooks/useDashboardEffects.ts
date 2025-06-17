
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";

export const useDashboardEffects = () => {
  const { toast } = useToast();
  const { currentEmpresa } = useAuth();
  const { metrics } = useOpenFinanceDashboard();
  const { saldoCaixa, entradasMesAtual, saidasMesAtual } = useTransactionsMetrics();

  // Verificar se há dados reais conectados
  const hasOpenFinanceData = metrics && metrics.integracoesAtivas > 0;
  const hasTransactionData = saldoCaixa > 0 || entradasMesAtual > 0 || saidasMesAtual > 0;
  const hasAnyRealData = hasOpenFinanceData || hasTransactionData;

  useEffect(() => {
    // Welcome toast na primeira visita apenas se houver dados
    const hasVisitedDashboard = localStorage.getItem('hasVisitedDashboard');
    if (!hasVisitedDashboard) {
      setTimeout(() => {
        if (hasAnyRealData) {
          toast({
            title: "Bem-vindo ao FounderPilot AI",
            description: "Seu copiloto estratégico para tomada de decisões de negócios com dados financeiros conectados.",
            className: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
            duration: 5000,
          });
        } else {
          toast({
            title: "Bem-vindo ao FounderPilot AI",
            description: "Conecte suas contas bancárias para começar a ver insights estratégicos baseados nos seus dados reais.",
            className: "bg-gradient-to-br from-blue/10 to-blue/5 border-blue/20",
            duration: 6000,
          });
        }
        localStorage.setItem('hasVisitedDashboard', 'true');
      }, 2500);
    }
    
    // Alerta de runway crítico apenas se houver dados reais
    if (hasAnyRealData && metrics?.alertaCritico) {
      setTimeout(() => {
        toast({
          title: "ALERTA: Runway Crítico",
          description: `Seu runway atual é de apenas ${metrics.runwayMeses.toFixed(1)} meses baseado nos dados das suas contas conectadas. Acesse a seção de Finanças para mais detalhes.`,
          variant: "destructive",
          duration: 8000,
        });
      }, 3000);
    }
  }, [toast, metrics?.alertaCritico, metrics?.runwayMeses, hasAnyRealData]);
};
