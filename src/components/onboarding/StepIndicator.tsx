
import React from "react";
import { Progress } from "@/components/ui/progress";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const progress = ((currentStep) / (totalSteps - 1)) * 100;
  
  return (
    <div className="mb-6">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>Dados Básicos</span>
        <span>Logo</span>
        <span>Documentos</span>
      </div>
    </div>
  );
};
