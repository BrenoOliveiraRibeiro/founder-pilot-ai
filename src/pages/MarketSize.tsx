
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { MarketSizeAnalysis } from "@/components/market/MarketSizeAnalysis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, LineChart, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MarketSizePage = () => {
  const { currentEmpresa } = useAuth();
  const { activeIntegrations } = useOpenFinanceConnections();
  const [showFinancialAlert, setShowFinancialAlert] = useState(true);
  
  const hasOpenFinanceConnection = activeIntegrations.length > 0;
  
  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Análise de Mercado</h1>
        
        {showFinancialAlert && !hasOpenFinanceConnection && (
          <Alert variant="default" className="bg-primary/5 border-primary/20">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Dados financeiros melhoram sua análise de mercado</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>
                Conecte seus dados financeiros via Open Finance para obter insights personalizados 
                que correlacionam suas finanças atuais com o potencial do mercado.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <Button size="sm" className="gap-2" asChild>
                  <Link to="/open-finance">
                    <Wallet className="h-4 w-4" />
                    Conectar dados financeiros
                  </Link>
                </Button>
                <Button 
                  onClick={() => setShowFinancialAlert(false)} 
                  variant="outline"
                  size="sm"
                >
                  Dispensar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {hasOpenFinanceConnection && (
          <Alert variant="default" className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <LineChart className="h-4 w-4 text-green-500" />
            <AlertTitle>Análise Enriquecida com Dados Financeiros</AlertTitle>
            <AlertDescription>
              Seus dados financeiros estão sendo utilizados para enriquecer esta análise de mercado, 
              fornecendo insights contextualizados e recomendações personalizadas para sua empresa.
            </AlertDescription>
          </Alert>
        )}
        
        <MarketSizeAnalysis />
      </div>
    </AppLayout>
  );
};

export default MarketSizePage;
