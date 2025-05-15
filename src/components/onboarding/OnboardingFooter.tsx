
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
  isMobile?: boolean;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  step,
  totalSteps,
  goToPrevStep,
  goToNextStep,
  onSubmit,
  isLoading,
  isMobile
}) => {
  return (
    <div className="flex justify-between mt-6">
      {step > 1 ? (
        <Button 
          type="button" 
          variant="outline" 
          onClick={goToPrevStep} 
          disabled={isLoading}
          className={isMobile ? 'py-6 px-4 text-base' : ''}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      ) : (
        <div></div> // Espaço vazio para manter o layout
      )}
      
      {step < totalSteps ? (
        <Button 
          type="button" 
          onClick={goToNextStep} 
          disabled={isLoading}
          className={isMobile ? 'py-6 px-4 text-base' : ''}
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button 
          type="button" 
          onClick={onSubmit} 
          disabled={isLoading}
          className={`group ${isMobile ? 'py-6 px-4 text-base' : ''}`}
        >
          <span className="flex items-center">
            {isLoading ? "Salvando..." : "Finalizar"} 
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      )}
    </div>
  );
};
