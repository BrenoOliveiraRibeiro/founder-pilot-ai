
import React from "react";
import { Clock } from "lucide-react";

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
  return (
    <div
      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl p-4 animate-fade-in shadow-sm ${
          message.sender === "user"
            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
            : "bg-gradient-to-br from-card to-apple-silver/20 dark:from-apple-spacegray/80 dark:to-apple-black/60 border border-border/40"
        }`}
      >
        <div className="whitespace-pre-line text-[15px]">{message.content}</div>
        <div className="text-xs opacity-70 mt-2 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};
