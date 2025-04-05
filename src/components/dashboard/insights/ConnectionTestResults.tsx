
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, CheckCircle } from "lucide-react";
import { formatBelvoError } from "@/lib/utils";
import { motion } from "framer-motion";

interface ConnectionTestResultsProps {
  error: string | null;
  testResult: any;
}

export const ConnectionTestResults: React.FC<ConnectionTestResultsProps> = ({ 
  error, 
  testResult 
}) => {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert variant="destructive" className="mb-3 border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro na conexão com Belvo</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="text-xs h-7 rounded-full"
              >
                <a href="/open-finance" className="flex items-center">
                  Configurar Open Finance <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    );
  }
  
  if (testResult && testResult.success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-4 rounded-xl border border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full">
            <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Conexão Belvo ativa</div>
            <div className="text-muted-foreground mt-0.5 text-xs">
              {testResult.accountsCount} contas de teste disponíveis para integração
            </div>
            <Button 
              variant="link" 
              size="sm" 
              asChild
              className="p-0 h-auto text-xs"
            >
              <a href="/open-finance" className="flex items-center mt-1">
                Configurar integrações <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return null;
};
