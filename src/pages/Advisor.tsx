
import React, { useEffect } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Brain } from "lucide-react";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { ChatMessage } from "@/components/advisor/ChatMessage";
import { EmptyStateView } from "@/components/advisor/EmptyStateView";
import { ChatInputForm } from "@/components/advisor/ChatInputForm";
import { ErrorMessage } from "@/components/advisor/ErrorMessage";

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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/80 to-primary/30 flex items-center justify-center mr-5 shadow-sm">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-medium tracking-tight">FounderPilot AI</h1>
            <p className="text-muted-foreground mt-1">
              {currentEmpresa?.nome ? `Seu copiloto estratégico para ${currentEmpresa.nome}` : 'Seu copiloto estratégico com acesso aos seus dados e análises'}
            </p>
          </div>
        </div>

        <Card className="mb-6 overflow-hidden border-none shadow-md hover:shadow-lg dark:shadow-none dark:border dark:border-border/40 transition-all duration-300 bg-gradient-to-br from-white to-apple-silver/30 dark:from-apple-spacegray dark:to-apple-black/90 rounded-2xl">
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
                  messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gradient-to-br from-card to-apple-silver/20 dark:from-apple-spacegray/80 dark:to-apple-black/60 rounded-2xl p-5 max-w-[80%] border border-border/40 shadow-sm">
                      <FriendlyLoadingMessage isLoading={isLoading} />
                    </div>
                  </div>
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
      </div>
    </AppLayout>
  );
};

export default Advisor;
