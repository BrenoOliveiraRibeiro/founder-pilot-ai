
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, SendIcon } from "lucide-react";

const sampleResponses = [
  "Based on your current burn rate, I recommend freezing any new hires for the next 60 days to extend your runway.",
  "Your SaaS subscriptions have increased by 35% in the last quarter. Consider auditing them to identify potential cost savings.",
  "Cash flow projections suggest you should start fundraising within the next 45 days to maintain your growth trajectory.",
  "Your customer acquisition cost has risen. Analyzing your marketing channels shows your best ROI is coming from direct sales, not ads."
];

export const AIAdvisorCard = () => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message to conversation
    setConversation([...conversation, `You: ${message}`]);
    setIsLoading(true);
    
    // Simulate AI response
    setTimeout(() => {
      const randomResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
      setConversation([...conversation, `You: ${message}`, `AI: ${randomResponse}`]);
      setIsLoading(false);
      setMessage("");
    }, 1000);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">AI Advisor</CardTitle>
          <CardDescription>Ask me anything about your startup finances</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 mb-4 overflow-y-auto space-y-3 max-h-56">
          {conversation.length === 0 ? (
            <div className="text-center text-muted-foreground my-8 px-4">
              <p className="mb-3">Need strategic advice? Ask me questions like:</p>
              <ul className="text-sm space-y-2 text-left">
                <li>• "How can I extend my runway?"</li>
                <li>• "What's my optimal team size at this stage?"</li>
                <li>• "When should I start raising my next round?"</li>
                <li>• "How do my metrics compare to similar startups?"</li>
              </ul>
            </div>
          ) : (
            conversation.map((msg, idx) => (
              <div 
                key={idx} 
                className={`text-sm p-2 rounded-md max-w-[85%] ${
                  msg.startsWith("You:") 
                    ? "bg-muted ml-auto" 
                    : "bg-primary/10 mr-auto"
                }`}
              >
                {msg}
              </div>
            ))
          )}
          {isLoading && (
            <div className="bg-primary/10 text-sm p-2 rounded-md max-w-[85%] mr-auto flex items-center gap-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></div>
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150"></div>
                <div className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300"></div>
              </div>
              <span>AI is thinking...</span>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Ask your AI advisor..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={isLoading}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
