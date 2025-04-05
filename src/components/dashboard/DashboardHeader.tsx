
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { OnboardingTooltip } from "../ui/onboarding-tooltip";
import { useToast } from "@/components/ui/use-toast";
import { FriendlyLoadingMessage } from "../ui/friendly-loading-message";
import { motion } from "framer-motion";

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
        className: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
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
        <motion.h1 
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentEmpresa ? `Dashboard: ${currentEmpresa.nome}` : "Dashboard"}
        </motion.h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex hover-lift micro-feedback"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <OnboardingTooltip
            id="refresh-button"
            title="Atualizar Dados"
            description="Clique aqui para atualizar seus dados financeiros e obter insights mais recentes."
          >
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="hover-lift micro-feedback"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? "Atualizando..." : "Atualizar"}
            </Button>
          </OnboardingTooltip>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Última atualização: {lastUpdated}</p>
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-2 h-2 rounded-full bg-green-500" 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          ></motion.div>
          <span>Dados conectados</span>
        </div>
      </div>
      
      {isRefreshing && (
        <motion.div 
          className="mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <FriendlyLoadingMessage isLoading={isRefreshing} />
        </motion.div>
      )}
      
      <motion.div 
        className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm 
                  border border-primary/10 p-5 rounded-xl 
                  flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 shadow-premium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        whileHover={{ scale: 1.01, boxShadow: "0 15px 30px -10px rgba(0, 59, 92, 0.15)" }}
      >
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="gradient-text">Insight do dia da IA</span>
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Seu burn rate aumentou 15% este mês. Considere revisar suas assinaturas recentes.
          </p>
        </div>
        <Button 
          size="sm"
          onClick={handleAskAI}
          className="whitespace-nowrap bg-gradient-to-br from-primary to-primary/90 
                   hover:from-primary hover:brightness-110 transition-all duration-300 
                   shadow-sm micro-feedback text-white"
        >
          Perguntar ao FounderPilot AI
        </Button>
      </motion.div>
    </div>
  );
};
