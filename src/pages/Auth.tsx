
import React, { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";
import { EmailConfirmation } from "@/components/auth/EmailConfirmation";

const formSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
});

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const { signIn, signUp, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Refs para os campos de input
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { error } = await signIn(values.email, values.password);
        if (error) {
          // Verificar se é erro de email não confirmado
          if (error.message.includes('confirmado') || error.message.includes('confirmed')) {
            setRegisteredEmail(values.email);
            setShowEmailConfirmation(true);
            return;
          }
          throw error;
        }
        
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
        
        // Redirecionar diretamente para o dashboard após login bem-sucedido
        navigate("/dashboard");
      } else {
        const { error } = await signUp(values.email, values.password);
        
        if (error) {
          // Se for erro de usuário já registrado, sugerir login
          if (error.message.includes('already registered')) {
            toast({
              title: "Email já cadastrado",
              description: "Este email já possui uma conta. Tente fazer login.",
              variant: "destructive",
            });
            setIsLogin(true);
            return;
          }
          throw error;
        }
        
        // Sucesso no cadastro - mostrar confirmação de email
        setRegisteredEmail(values.email);
        setShowEmailConfirmation(true);
        
        toast({
          title: "Conta criada com sucesso!",
          description: "Verifique seu email para confirmar a conta.",
          className: "bg-green-50 border-green-200",
        });
      }
    } catch (error: any) {
      console.error("Erro de autenticação:", error);
      toast({
        title: "Erro",
        description: error.message || "Falha na autenticação. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowEmailConfirmation(false);
    setIsLogin(true);
    setRegisteredEmail("");
    form.reset();
  };

  // Função para lidar com a tecla Enter no campo de email
  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  // Função para lidar com a tecla Enter no campo de senha
  const handlePasswordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  // Se estiver mostrando confirmação de email
  if (showEmailConfirmation && registeredEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
        <EmailConfirmation 
          email={registeredEmail}
          onBackToLogin={handleBackToLogin}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-background/95 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center justify-center mb-6"
            >
              <FounderPilotLogo className="h-12 w-12 text-primary mr-3" />
              <CardTitle className="text-2xl font-bold">FounderPilot AI</CardTitle>
            </motion.div>
            
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Bem-vindo ao seu copiloto estratégico" : "Crie sua conta"}
            </CardTitle>
            
            <CardDescription className="text-center">
              {isLogin ? "Entre com suas credenciais para continuar" : "Preencha os dados abaixo para começar"}
            </CardDescription>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-center text-sm font-medium text-muted-foreground mt-2"
            >
              {isLogin ? "Seu copiloto para decisões estratégicas" : "Para fundadores que pensam grande e agem rápido"}
            </motion.p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="seu@email.com" 
                          {...field} 
                          ref={emailRef}
                          onKeyDown={handleEmailKeyDown}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="******" 
                          {...field} 
                          ref={passwordRef}
                          onKeyDown={handlePasswordKeyDown}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {isLogin && (
                  <div className="text-right">
                    <Button variant="link" className="p-0 h-auto text-sm" onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Redefinição de senha",
                        description: "Entre em contato conosco para redefinir sua senha.",
                      });
                    }}>
                      Esqueceu a senha?
                    </Button>
                  </div>
                )}
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Aguarde..." : isLogin ? "Entrar no painel" : "Criar conta"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="mt-2 text-center text-sm">
              {isLogin ? (
                <p>
                  Ainda não tem uma conta?{" "}
                  <Button variant="link" className="p-0" onClick={() => setIsLogin(false)}>
                    Experimente gratuitamente
                  </Button>
                </p>
              ) : (
                <p>
                  Já tem uma conta?{" "}
                  <Button variant="link" className="p-0" onClick={() => setIsLogin(true)}>
                    Faça login
                  </Button>
                </p>
              )}
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
