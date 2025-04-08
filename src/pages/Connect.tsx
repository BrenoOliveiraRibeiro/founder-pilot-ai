
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BanknoteIcon, CircuitBoard, CircleDollarSign, Database, LockIcon, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Connect = () => {
  const navigate = useNavigate();
  const { empresas } = useAuth();

  // Check if empresas is loaded before rendering
  React.useEffect(() => {
    console.log("Empresas in Connect:", empresas);
  }, [empresas]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Conecte Seus Dados Financeiros</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Para liberar todo o potencial do FounderPilot AI, conecte suas contas financeiras através do Open Finance. 
            Isso permitirá análises de MRR, Runway, Fluxo de Caixa e muito mais.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="border bg-card shadow-md hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BanknoteIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Open Finance</CardTitle>
                  <CardDescription className="text-sm">
                    Conecte suas contas bancárias corporativas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <CircleDollarSign className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Fluxo de caixa em tempo real</h3>
                    <p className="text-sm text-muted-foreground">Visualize receitas, despesas e tendências financeiras automaticamente.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Categorização inteligente</h3>
                    <p className="text-sm text-muted-foreground">Nossa IA identifica e categoriza transações para análise precisa.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <LockIcon className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Segurança avançada</h3>
                    <p className="text-sm text-muted-foreground">Utilizamos criptografia de ponta a ponta e acesso somente leitura.</p>
                  </div>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full group font-medium"
                onClick={() => navigate("/open-finance")}
              >
                <span className="flex items-center">
                  Conectar Open Finance
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border bg-card shadow-md hover:shadow-lg transition-all duration-300 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CircuitBoard className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Integrações</CardTitle>
                  <CardDescription className="text-sm">
                    Conecte outros sistemas e plataformas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 border rounded-md p-3">
                  <div className="h-8 w-8 bg-[#00ab6b]/10 text-[#00ab6b] rounded-md flex items-center justify-center font-bold">
                    S
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">Stripe</h3>
                    <p className="text-xs text-muted-foreground truncate">Receitas e assinaturas</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border rounded-md p-3">
                  <div className="h-8 w-8 bg-[#397af3]/10 text-[#397af3] rounded-md flex items-center justify-center font-bold">
                    Q
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">QuickBooks</h3>
                    <p className="text-xs text-muted-foreground truncate">Dados contábeis</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border rounded-md p-3">
                  <div className="h-8 w-8 bg-primary/10 text-primary rounded-md flex items-center justify-center font-bold">
                    I
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">Investidores</h3>
                    <p className="text-xs text-muted-foreground truncate">Gerenciar acesso</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 border rounded-md p-3">
                  <div className="h-8 w-8 bg-[#ef4444]/10 text-[#ef4444] rounded-md flex items-center justify-center font-bold">
                    +
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium truncate">Mais opções</h3>
                    <p className="text-xs text-muted-foreground truncate">Outras integrações</p>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full mt-4 group font-medium"
                onClick={() => navigate("/settings")}
              >
                <span className="flex items-center">
                  Gerenciar Integrações
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Connect;
