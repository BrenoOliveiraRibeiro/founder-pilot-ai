
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Download, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
  const lastUpdated = new Date().toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { currentEmpresa } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
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
          <Button variant="secondary" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Última atualização: {lastUpdated}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-subtle"></div>
          <span>Dados conectados</span>
        </div>
      </div>
      
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Insight do dia da IA
          </h3>
          <p className="text-sm text-foreground/80">
            Seu burn rate aumentou 15% este mês. Considere revisar suas assinaturas recentes.
          </p>
        </div>
        <Button size="sm" className="whitespace-nowrap" onClick={handleAskAI}>
          Perguntar ao Co-Founder IA
        </Button>
      </div>
    </div>
  );
};
