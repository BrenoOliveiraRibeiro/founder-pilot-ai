
import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === "user";
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={cn(
          "max-w-[90%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 shadow-md transition-all break-words",
          isUser 
            ? "bg-primary text-primary-foreground ml-2 sm:ml-4" 
            : "relative glass-effect border border-primary/10"
        )}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10 dark:border-primary/5">
            <div className="h-6 w-6 sm:h-6 sm:w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-3 w-3 sm:h-3 sm:w-3 text-primary/70" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-primary/70">FounderPilot AI</span>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
        <div className={cn(
          "text-[10px] sm:text-xs mt-2 opacity-70",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};
