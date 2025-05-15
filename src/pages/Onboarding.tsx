
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

const Onboarding = () => {
  const { user } = useAuth();
  const { isMobile } = useIsMobile();
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-2 sm:p-4">
      <Card className={`w-full ${isMobile ? 'max-w-full' : 'max-w-2xl'}`}>
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <FounderPilotLogo className="w-10 h-10 sm:w-12 sm:h-12 mr-2 sm:mr-3" />
            <CardTitle className="text-xl sm:text-2xl font-bold">FounderPilot AI</CardTitle>
          </div>
          <CardTitle className="text-lg sm:text-xl text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            {user ? `Olá ${user.email}, fale um pouco sobre sua empresa para começarmos` : 'Fale um pouco sobre sua empresa para começarmos'}
          </CardDescription>
          
          <StepIndicator currentStep={1} totalSteps={3} />
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
