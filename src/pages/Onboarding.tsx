import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

const Onboarding = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only keeping basic state and UI at this level
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
      
      {/* Dialog para confirmação ou erros */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uploads em andamento</DialogTitle>
          </DialogHeader>
          <div>
            <p>Estamos processando seus arquivos...</p>
            <Progress value={75} className="my-4" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Onboarding;
