
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
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Conecte Seus Dados Financeiros</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Para liberar todo o potencial do FounderPilot AI, conecte suas contas financeiras através do Open Finance. 
            Isso permitirá análises de MRR, Runway, Fluxo de Caixa e muito mais.
          </p>
        </div>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BanknoteIcon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Open Finance</CardTitle>
            </div>
            <CardDescription>
              Conecte suas contas bancárias corporativas para análise automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <CircleDollarSign className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Analise seu fluxo de caixa</h3>
                  <p className="text-sm text-muted-foreground">Visualize receitas, despesas e tendências financeiras automaticamente.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Categorização automática</h3>
                  <p className="text-sm text-muted-foreground">Nossa IA identifica e categoriza transações para análise profunda.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <LockIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-medium">Segurança em primeiro lugar</h3>
                  <p className="text-sm text-muted-foreground">Utilizamos criptografia de ponta a ponta e acesso somente leitura.</p>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="w-full group"
              onClick={() => navigate("/open-finance")}
            >
              <span className="flex items-center">
                Conectar Open Finance
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CircuitBoard className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-xl">Integrações</CardTitle>
            </div>
            <CardDescription>
              Conecte outros sistemas e plataformas para uma análise completa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 border rounded-md p-3">
                <div className="h-8 w-8 bg-[#00ab6b]/10 text-[#00ab6b] rounded-md flex items-center justify-center font-bold">
                  S
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Stripe</h3>
                  <p className="text-xs text-muted-foreground">Conecte-se ao Stripe para sincronizar receitas e assinaturas.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border rounded-md p-3">
                <div className="h-8 w-8 bg-[#397af3]/10 text-[#397af3] rounded-md flex items-center justify-center font-bold">
                  Q
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">QuickBooks</h3>
                  <p className="text-xs text-muted-foreground">Importe dados contábeis e métricas financeiras.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border rounded-md p-3">
                <div className="h-8 w-8 bg-primary/10 text-primary rounded-md flex items-center justify-center font-bold">
                  I
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Investidores</h3>
                  <p className="text-xs text-muted-foreground">Gerencie o acesso de seus investidores aos dados financeiros.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 border rounded-md p-3">
                <div className="h-8 w-8 bg-[#ef4444]/10 text-[#ef4444] rounded-md flex items-center justify-center font-bold">
                  +
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">Outras integrações</h3>
                  <p className="text-xs text-muted-foreground">Conecte ferramentas adicionais para expandir as capacidades.</p>
                </div>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full mt-4 group"
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
    </AppLayout>
  );
};

export default Connect;
