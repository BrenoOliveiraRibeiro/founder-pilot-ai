
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Sparkles, AlertCircle, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { FriendlyLoadingMessage } from "../ui/friendly-loading-message";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "../shared/FounderPilotLogo";
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";

export const DashboardHeader = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { currentEmpresa } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { metrics, refetch } = useOpenFinanceDashboard();

  const lastUpdated = metrics?.ultimaAtualizacao 
    ? new Date(metrics.ultimaAtualizacao).toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    toast({
      title: "Atualizando dados",
      description: "Sincronizando dados do Open Finance...",
      className: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    });
    
    try {
      await refetch();
      
      toast({
        title: "Dados atualizados",
        description: "Seus dados foram sincronizados com sucesso.",
        className: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
      });
    } catch (error) {
      toast({
        title: "Erro na atualização",
        description: "Não foi possível sincronizar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAskAI = () => {
    navigate("/advisor");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: -10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  const getRecommendationText = () => {
    if (!metrics) {
      return "Conecte suas contas bancárias para análises personalizadas com base em dados reais.";
    }

    if (metrics.integracoesAtivas === 0) {
      return "Conecte suas contas bancárias via Open Finance para obter insights precisos baseados em dados reais.";
    }

    if (metrics.alertaCritico) {
      return `Seu runway é crítico: apenas ${metrics.runwayMeses.toFixed(1)} meses restantes. Recomendo revisar despesas urgentemente.`;
    }

    if (metrics.fluxoCaixa < 0) {
      return `Seu fluxo de caixa está negativo este mês. Considere revisar suas despesas ou aumentar a receita.`;
    }

    return `Baseado nos dados reais: ${metrics.runwayMeses.toFixed(1)} meses de runway. Continue monitorando suas métricas.`;
  };

  return (
    <motion.div 
      className="mb-8 space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-3"
          variants={itemVariants}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-balance">
              Dashboard
            </h1>
          </div>
        </motion.div>
        <motion.div className="flex items-center gap-2" variants={itemVariants}>
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex hover-lift micro-feedback focus-ring"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isRefreshing}
            className="hover-lift micro-feedback focus-ring"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? "Sincronizando..." : "Sincronizar"}
          </Button>
        </motion.div>
      </div>
      
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground"
        variants={itemVariants}
      >
        <p>Última atualização: <span className="text-foreground/80">{lastUpdated}</span></p>
        <div className="flex items-center gap-2">
          <motion.div 
            className={`w-2 h-2 rounded-full ${metrics?.integracoesAtivas ? 'bg-green-500' : 'bg-amber-500'}`}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          ></motion.div>
          <span>
            {metrics?.integracoesAtivas 
              ? `${metrics.integracoesAtivas} conta(s) conectada(s)` 
              : "Dados simulados"}
          </span>
        </div>
      </motion.div>
      
      {isRefreshing && (
        <motion.div 
          className="mt-2 px-4 py-3 bg-secondary/50 rounded-lg"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <FriendlyLoadingMessage isLoading={isRefreshing} />
        </motion.div>
      )}
      
      <motion.div 
        className="bg-gradient-to-br from-primary/10 via-primary/7 to-primary/5 backdrop-blur-sm 
                  border border-primary/15 p-5 rounded-xl 
                  flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 shadow-card
                  interactive-card"
        variants={itemVariants}
        whileHover={{ scale: 1.01, boxShadow: "0 15px 30px -10px rgba(0, 59, 92, 0.15)" }}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <FounderPilotLogo className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground flex items-center gap-2">
              <span className="gradient-text">FounderPilot</span>
              {metrics?.integracoesAtivas > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Dados Reais
                </span>
              )}
            </h3>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed text-pretty">
            {getRecommendationText()}
          </p>
        </div>
        <Button 
          size="sm"
          onClick={handleAskAI}
          className="whitespace-nowrap bg-gradient-to-br from-primary to-primary/90 
                   hover:from-primary hover:brightness-110 transition-all duration-300 
                   hover:-translate-y-0.5 shadow-sm micro-feedback text-white focus-ring"
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          Perguntar ao FounderPilot
        </Button>
      </motion.div>
      
      {metrics?.alertaCritico && (
        <motion.div
          className="mt-1 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 ml-1"
          variants={itemVariants}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Runway crítico detectado: {metrics.runwayMeses.toFixed(1)} meses restantes baseado em dados reais</span>
        </motion.div>
      )}
    </motion.div>
  );
};
