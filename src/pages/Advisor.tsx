
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Brain, ChevronRight, SendIcon } from "lucide-react";

// Sample suggestions and responses
const suggestions = [
  "How can I extend my runway?",
  "Should I prioritize growth or profitability?",
  "When should I start my fundraising process?",
  "How does my burn rate compare to other startups?",
];

const sampleResponses = [
  "Based on your financial data, I'd recommend focusing on extending your runway. Your current burn rate of $12,733 per week gives you approximately 3.5 months of runway. To extend this, consider:\n\n1. **Review SaaS Subscriptions**: Your software costs have increased 28% in the last quarter.\n\n2. **Optimize Team Structure**: Your engineering expenses are higher than similar startups at your stage.\n\n3. **Prioritize Revenue-Generating Activities**: Focus on customer acquisition channels with the highest ROI.\n\nImplementing these changes could extend your runway by an additional 2-3 months, which would be crucial for your next fundraising cycle.",
  
  "At your current stage with $45,800 in monthly revenue and a growth rate of 12.5%, I'd recommend a balanced approach that slightly favors growth. Here's why:\n\n1. **Market Timing**: Your industry typically sees higher valuations for companies growing at 15%+ MoM.\n\n2. **Competitor Analysis**: Your direct competitors are growing at an average of 18% MoM.\n\n3. **Unit Economics**: Your CAC:LTV ratio is healthy at 1:4, indicating room for more aggressive acquisition.\n\nConsider increasing your marketing spend by 20% while maintaining tight control on non-growth expenses. This should help you achieve an optimal growth rate without significantly reducing your runway.",
];

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const Advisor = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: randomResponse,
        sender: "ai",
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Strategic Advisor</h1>
            <p className="text-muted-foreground">
              Your co-founder AI assistant for strategic decision-making
            </p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-6 min-h-[60vh] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6">
                {messages.length === 0 ? (
                  <div className="text-center py-20">
                    <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
                    <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                      I'm your AI co-founder, specialized in startup strategy, financial analysis, 
                      and decision support. I have access to your financial data and market insights.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                      {suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="justify-between"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                          <ChevronRight className="h-4 w-4 ml-2 opacity-70" />
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <div className="whitespace-pre-line">{message.content}</div>
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 max-w-[80%]">
                      <div className="flex gap-2 items-center">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-150"></div>
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse delay-300"></div>
                        </div>
                        <span className="text-sm">Analyzing your data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSendMessage} className="pt-4 border-t">
                <div className="flex gap-4">
                  <Input
                    placeholder="Ask me anything about your startup strategy..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading}>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Advisor;
