
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";

interface EmailConfirmationProps {
  email: string;
  onBackToLogin: () => void;
}

export const EmailConfirmation: React.FC<EmailConfirmationProps> = ({ email, onBackToLogin }) => {
  const [isResending, setIsResending] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    setIsResending(true);
    try {
      // Reenviar email de confirmação tentando cadastrar novamente
      const { error } = await signUp(email, "");
      
      if (error && !error.message.includes("already registered")) {
        throw error;
      }
      
      toast({
        title: "Email reenviado",
        description: "Verifique sua caixa de entrada novamente.",
        className: "bg-green-50 border-green-200",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar email",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-4 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
          >
            <Mail className="h-8 w-8 text-primary" />
          </motion.div>
          
          <CardTitle className="text-2xl">Confirme seu email</CardTitle>
          <CardDescription className="text-base">
            Enviamos um link de confirmação para <br />
            <strong className="text-foreground">{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Próximos passos:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>Verifique sua caixa de entrada (e spam)</li>
                  <li>Clique no link de confirmação</li>
                  <li>Retorne e faça login normalmente</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResendConfirmation}
              variant="outline"
              className="w-full"
              disabled={isResending}
            >
              {isResending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar email de confirmação
                </>
              )}
            </Button>
            
            <Button
              onClick={onBackToLogin}
              variant="ghost"
              className="w-full"
            >
              Voltar para o login
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
