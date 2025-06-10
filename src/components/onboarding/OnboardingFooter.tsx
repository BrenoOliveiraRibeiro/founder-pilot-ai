
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface OnboardingFooterProps {
  step: number;
  totalSteps: number;
  goToPrevStep: () => void;
  goToNextStep: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  step,
  totalSteps,
  goToPrevStep,
  goToNextStep,
  onSubmit,
  isLoading
}) => {
  return (
    <div className="flex justify-between mt-6">
      {step > 1 ? (
        <Button type="button" variant="outline" onClick={goToPrevStep} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      ) : (
        <div></div> // Espaço vazio para manter o layout
      )}
      
      {step < totalSteps ? (
        <Button type="button" onClick={goToNextStep} disabled={isLoading}>
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button type="button" onClick={onSubmit} className="group" disabled={isLoading}>
          <span className="flex items-center">
            {isLoading ? "Salvando..." : "Finalizar"} 
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      )}
    </div>
  );
};
