
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookOpen, SendIcon } from "lucide-react";

interface ChatInputFormProps {
  input: string;
  isLoading: boolean;
  conversationHistory: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  input,
  isLoading,
  conversationHistory,
  onInputChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-4 border-t bg-card/50 backdrop-blur-sm">
      <div className="flex gap-3">
        <Input
          placeholder="Pergunte sobre estratégia, finanças ou crescimento..."
          value={input}
          onChange={onInputChange}
          className="flex-1 rounded-xl border-primary/20 focus-visible:ring-primary/30 py-6 px-4 shadow-sm"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading}
          className="rounded-xl px-5 bg-gradient-to-br from-primary to-primary/80 hover:from-primary hover:to-primary/90 transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <SendIcon className="h-4 w-4 mr-2" />
          Enviar
        </Button>
      </div>
      {conversationHistory && (
        <div className="mt-2 flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            <BookOpen className="h-3 w-3" />
            Ver histórico
          </Button>
        </div>
      )}
    </form>
  );
};
