
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";
import { ChatMessage } from "@/components/advisor/ChatMessage";
import { EmptyStateView } from "@/components/advisor/EmptyStateView";
import { ChatInputForm } from "@/components/advisor/ChatInputForm";
import { ErrorMessage } from "@/components/advisor/ErrorMessage";
import { Message } from "@/components/advisor/ChatMessage";

interface ChatContainerProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  isError: boolean;
  conversationHistory: boolean;
  suggestions: string[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  userName?: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onSuggestionClick: (suggestion: string) => void;
  scrollToBottom: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  input,
  isLoading,
  isError,
  conversationHistory,
  suggestions,
  messagesEndRef,
  userName,
  onInputChange,
  onSubmit,
  onSuggestionClick,
  scrollToBottom
}) => {
  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
                  userName={userName}
                  suggestions={suggestions}
                  onSuggestionClick={onSuggestionClick}
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
                  <div className="glass-effect rounded-2xl p-3 sm:p-5 max-w-[90%] sm:max-[80%] border border-primary/10 shadow-lg">
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
              onInputChange={onInputChange}
              onSubmit={onSubmit}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
