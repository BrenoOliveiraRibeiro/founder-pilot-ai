
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { OnboardingTooltip } from "../ui/onboarding-tooltip";
import { useToast } from "@/components/ui/use-toast";
import { FriendlyLoadingMessage } from "../ui/friendly-loading-message";

export const DashboardHeader = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdated = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { currentEmpresa } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Show toast to improve feedback
    toast({
      title: "Atualizando dados",
      description: "Seus dados estão sendo atualizados...",
    });
    
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false);
      
      toast({
        title: "Dados atualizados",
        description: "Seus dados foram atualizados com sucesso.",
      });
      
      window.location.reload();
    }, 1500);
  };

  const handleAskAI = () => {
    navigate("/advisor");
  };

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {currentEmpresa ? `Dashboard: ${currentEmpresa.nome}` : "Dashboard"}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <OnboardingTooltip
            id="refresh-button"
            title="Atualizar Dados"
            description="Clique aqui para atualizar seus dados financeiros e obter insights mais recentes."
          >
            <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
          </OnboardingTooltip>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Última atualização: {lastUpdated}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-subtle"></div>
          <span>Dados conectados</span>
        </div>
      </div>
      
      {isRefreshing && (
        <div className="mt-2">
          <FriendlyLoadingMessage isLoading={isRefreshing} />
        </div>
      )}
      
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/10 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 shadow-sm">
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Insight do dia da IA
          </h3>
          <p className="text-sm text-foreground/80">
            Seu burn rate aumentou 15% este mês. Considere revisar suas assinaturas recentes.
          </p>
        </div>
        <Button 
          size="sm" 
          className="whitespace-nowrap bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary transition-all duration-300 shadow-sm"
          onClick={handleAskAI}
        >
          Perguntar ao FounderPilot AI
        </Button>
      </div>
    </div>
  );
};
