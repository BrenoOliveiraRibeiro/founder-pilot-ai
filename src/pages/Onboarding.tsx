
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { Toaster } from "@/components/ui/toaster";

const Onboarding = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Toaster />
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <FounderPilotLogo className="w-12 h-12 text-primary mr-3" />
            <CardTitle className="text-2xl font-bold">FounderPilot AI</CardTitle>
          </div>
          <CardTitle className="text-xl text-center">Configuração Inicial</CardTitle>
          <CardDescription className="text-center">
            Fale um pouco sobre sua empresa para começarmos
          </CardDescription>
          
          <StepIndicator currentStep={1} totalSteps={3} />
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
