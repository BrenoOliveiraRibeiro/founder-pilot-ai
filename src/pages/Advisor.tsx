
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useAdvisorChat } from "@/hooks/useAdvisorChat";
import { AdvisorHeader } from "@/components/advisor/AdvisorHeader";
import { FinancialDataStatus } from "@/components/advisor/FinancialDataStatus";
import { QuickMetrics } from "@/components/advisor/QuickMetrics";
import { ChatContainer } from "@/components/advisor/ChatContainer";
import { SyncStatus } from "@/components/advisor/SyncStatus";

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
    scrollToBottom,
    hasFinancialData,
    financialMetrics
  } = useAdvisorChat({
    empresaId: currentEmpresa?.id,
    empresaNome: currentEmpresa?.nome,
    userNome: profile?.nome
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-1 sm:px-0">
        <AdvisorHeader
          empresaNome={currentEmpresa?.nome}
          hasFinancialData={hasFinancialData}
        />

        <FinancialDataStatus hasFinancialData={hasFinancialData} />

        <QuickMetrics
          hasFinancialData={hasFinancialData}
          financialMetrics={financialMetrics}
        />

        <ChatContainer
          messages={messages}
          input={input}
          isLoading={isLoading}
          isError={isError}
          conversationHistory={conversationHistory}
          suggestions={suggestions}
          messagesEndRef={messagesEndRef}
          userName={profile?.nome?.split(' ')[0]}
          onInputChange={handleInputChange}
          onSubmit={handleSendMessage}
          onSuggestionClick={handleSuggestionClick}
          scrollToBottom={scrollToBottom}
        />

        <SyncStatus
          hasFinancialData={hasFinancialData}
          ultimaAtualizacao={financialMetrics?.ultimaAtualizacao}
        />
      </div>
    </AppLayout>
  );
};

export default Advisor;
