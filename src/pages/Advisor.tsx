
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
import { Sparkles } from "lucide-react";

const Advisor = () => {
  const { currentEmpresa, profile } = useAuth();
  const { metrics } = useFinanceData(currentEmpresa?.id || null);
  
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
    scrollToBottom
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
      <div className="max-w-5xl mx-auto">
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mr-5 shadow-lg relative z-10">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <motion.h1 
              className="text-gradient text-3xl md:text-4xl font-medium tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              FounderPilot AI
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              {currentEmpresa?.nome ? `Seu copiloto estratégico para ${currentEmpresa.nome}` : 'Seu copiloto estratégico com acesso aos seus dados e análises'}
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Card className="mb-6 overflow-hidden border-none shadow-xl hover:shadow-2xl dark:shadow-none dark:border dark:border-border/40 transition-all duration-500 bg-gradient-to-br from-white to-gray-50/30 dark:from-slate-800/90 dark:to-slate-900/90 rounded-3xl backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="min-h-[70vh] flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      className="space-y-6"
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
                      <div className="glass-effect rounded-2xl p-5 max-w-[80%] border border-primary/10 shadow-lg">
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
      </div>
    </AppLayout>
  );
};

export default Advisor;
