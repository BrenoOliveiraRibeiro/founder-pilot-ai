
import React from "react";
import { Progress } from "@/components/ui/progress";

interface ConnectionProgressProps {
  connectionProgress: number;
  connectionStatus: string;
  isVisible: boolean;
}

export const ConnectionProgress = ({
  connectionProgress,
  connectionStatus,
  isVisible
}: ConnectionProgressProps) => {
  if (!isVisible) return null;
  
  return (
    <div className="mb-6 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{connectionStatus}</span>
        <span className="text-muted-foreground">{connectionProgress}%</span>
      </div>
      <Progress value={connectionProgress} className="h-2" />
    </div>
  );
};
