
import React from "react";
import { Button } from "@/components/ui/button";
import { Brain, Download, RefreshCw } from "lucide-react";

export const DashboardHeader = () => {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>Last updated: {lastUpdated}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse-subtle"></div>
          <span>Data connected</span>
        </div>
      </div>
      
      <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1 flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            AI Insight of the day
          </h3>
          <p className="text-sm text-foreground/80">
            Your cash burn has increased by 15% this month. Consider reviewing your recent subscriptions.
          </p>
        </div>
        <Button size="sm" className="whitespace-nowrap">Ask AI Advisor</Button>
      </div>
    </div>
  );
};
