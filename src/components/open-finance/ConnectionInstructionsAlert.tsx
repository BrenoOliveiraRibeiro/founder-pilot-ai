
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, CircleAlert, ChevronRight, Info } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/contexts/AuthContext";

export const ConnectionInstructionsAlert = () => {
  const navigate = useNavigate();
  const { currentEmpresa } = useAuth();

  return (
    <Alert className="mb-6 border-primary/30 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertTitle className="mb-2 text-primary">Como conectar sua conta bancária</AlertTitle>
      
      <AlertDescription className="space-y-4">
        <div className="text-sm">
          <p className="mb-2">Para conectar uma conta bancária ao FounderPilot, siga os passos abaixo:</p>
          
          <div className="space-y-2 ml-1 mt-3">
            {!currentEmpresa && (
              <div className="flex items-start gap-2">
                <CircleAlert className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Cadastre sua empresa</p>
                  <p className="text-muted-foreground text-xs">Complete o cadastro da sua empresa para prosseguir.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-1 text-xs border-primary/50 text-primary"
                    onClick={() => navigate('/onboarding')}
                  >
                    Cadastrar empresa <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-2">
              <CheckCircle2 className={`h-4 w-4 mt-0.5 flex-shrink-0 ${currentEmpresa ? 'text-green-600' : 'text-muted-foreground'}`} />
              <div>
                <p className={`font-medium ${currentEmpresa ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {currentEmpresa ? 'Empresa cadastrada' : 'Cadastre sua empresa'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Selecione seu banco</p>
                <p className="text-muted-foreground text-xs">Escolha um banco na lista abaixo e selecione-o.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Conecte usando Widget ou OAuth</p>
                <p className="text-muted-foreground text-xs">
                  Use o Widget para uma experiência completa ou OAuth para conectar via redirecionamento.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Complete a autenticação</p>
                <p className="text-muted-foreground text-xs">
                  Em modo Sandbox, use as credenciais de teste do Pluggy. Em produção, use suas credenciais reais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
