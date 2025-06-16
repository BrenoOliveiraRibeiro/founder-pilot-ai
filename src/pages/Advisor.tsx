
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { ChatMessage } from "@/components/advisor/ChatMessage";
import { EmptyStateView } from "@/components/advisor/EmptyStateView";
import { ChatInputForm } from "@/components/advisor/ChatInputForm";
import { ErrorMessage } from "@/components/advisor/ErrorMessage";
import { Sparkles, Database, AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Advisor = () => {
  const { currentEmpresa, profile } = useAuth();
  const { metrics } = useFinanceData(currentEmpresa?.id || null);
  const isMobile = useIsMobile();
  
  const {
    messages,
    input,
    isLoading,
    isError,
    conversationHistory,
    suggestions,
    messagesEndRef,
    handleSendMessage,
    handleInputChange,
    handleSuggestionClick,
    scrollToBottom,
    hasFinancialData,
    financialMetrics
  } = useAdvisorChat({
    empresaId: currentEmpresa?.id,
    empresaNome: currentEmpresa?.nome,
    userNome: profile?.nome
  });

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-1 sm:px-0">
        <motion.div 
          className="flex items-center mb-4 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mr-3 sm:mr-5 shadow-lg relative z-10`}>
              <Sparkles className={`${isMobile ? "h-6 w-6" : "h-8 w-8"} text-white`} />
            </div>
          </div>
          <div className="flex-1">
            <motion.h1 
              className="text-gradient text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              FounderPilot AI
            </motion.h1>
            <motion.div 
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <p className="text-xs sm:text-sm text-muted-foreground">
                {currentEmpresa?.nome ? `Copiloto estratégico para ${currentEmpresa.nome}` : 'Seu copiloto estratégico'}
              </p>
              {hasFinancialData ? (
                <Badge variant="outline" className="text-xs">
                  <Database className="h-3 w-3 mr-1" />
                  Dados Reais
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Demo
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status dos dados financeiros */}
        {!hasFinancialData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Conecte suas contas bancárias</span> para receber insights baseados em dados reais. 
                Atualmente usando dados demonstrativos para análises gerais.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Métricas rápidas quando há dados reais */}
        {hasFinancialData && financialMetrics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 border-primary/20">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Runway</p>
                    <p className={`font-bold ${financialMetrics.runwayMeses < 3 ? 'text-destructive' : financialMetrics.runwayMeses < 6 ? 'text-warning' : 'text-green-600'}`}>
                      {financialMetrics.runwayMeses.toFixed(1)}m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Caixa</p>
                    <p className="font-bold">
                      R$ {(financialMetrics.saldoTotal / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Burn Rate</p>
                    <p className="font-bold">
                      R$ {(financialMetrics.burnRate / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fluxo</p>
                    <p className={`font-bold ${financialMetrics.fluxoCaixa >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      R$ {(financialMetrics.fluxoCaixa / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="mb-6 overflow-hidden border-none shadow-xl hover:shadow-2xl dark:shadow-none dark:border dark:border-border/40 transition-all duration-500 bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-800/90 dark:to-slate-900/90 rounded-2xl sm:rounded-3xl backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="min-h-[75vh] sm:min-h-[70vh] flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
                  {messages.length === 0 ? (
                    <EmptyStateView
                      userName={profile?.nome?.split(' ')[0]}
                      suggestions={suggestions}
                      onSuggestionClick={handleSuggestionClick}
                    />
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-4 sm:space-y-6"
                    >
                      {messages.map((message) => (
                        <motion.div key={message.id} variants={itemVariants}>
                          <ChatMessage message={message} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {isLoading && (
                    <motion.div 
                      className="flex justify-start animate-fade-in"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="glass-effect rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-w-[80%] border border-primary/10 shadow-lg">
                        <FriendlyLoadingMessage isLoading={isLoading} />
                      </div>
                    </motion.div>
                  )}
                  
                  <ErrorMessage isError={isError} />
                  
                  <div ref={messagesEndRef} />
                </div>
                
                <ChatInputForm
                  input={input}
                  isLoading={isLoading}
                  conversationHistory={conversationHistory}
                  onInputChange={handleInputChange}
                  onSubmit={handleSendMessage}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status da sincronização */}
        {hasFinancialData && financialMetrics?.ultimaAtualizacao && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Dados sincronizados • {new Date(financialMetrics.ultimaAtualizacao).toLocaleString('pt-BR')}
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Advisor;
