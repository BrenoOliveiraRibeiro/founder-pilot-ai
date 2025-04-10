
import React, { useState } from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { MarketSizeAnalysis } from "@/components/market/MarketSizeAnalysis";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOpenFinanceConnections } from "@/hooks/useOpenFinanceConnections";

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
              <div className="flex items-center gap-2">
                <a 
                  href="/open-finance" 
                  className="text-primary underline underline-offset-4 text-sm font-medium"
                >
                  Conectar dados financeiros
                </a>
                <button 
                  onClick={() => setShowFinancialAlert(false)} 
                  className="text-muted-foreground text-xs"
                >
                  Dispensar
                </button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <MarketSizeAnalysis />
      </div>
    </AppLayout>
  );
};

export default MarketSizePage;
