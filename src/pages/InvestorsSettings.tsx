
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InvestorsConnectionManager } from "@/components/investors/InvestorsConnectionManager";

const InvestorsSettings = () => {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto py-6">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/settings" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Configurações
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Connect your Investors</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as permissões de acesso para seus investidores
          </p>
        </div>
        
        <Card className="border-none shadow-md dark:border dark:border-border/40">
          <CardContent className="p-6">
            <InvestorsConnectionManager />
          </CardContent>
        </Card>
        
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-3">Sobre o Connect your Investors</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h3 className="font-medium">Como funciona?</h3>
              <p className="text-sm text-muted-foreground">
                Seus investidores receberão um convite por email com um link para acessar um 
                dashboard personalizado com as informações que você escolher compartilhar. Você 
                tem total controle sobre quais métricas e dados serão visíveis.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-medium">Benefícios</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5">
                <li>• Mantenha seus investidores informados automaticamente</li>
                <li>• Economize tempo na preparação de relatórios</li>
                <li>• Demonstre transparência e organização</li>
                <li>• Controle precisamente quais informações são compartilhadas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default InvestorsSettings;
