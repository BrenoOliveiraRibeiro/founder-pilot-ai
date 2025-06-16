
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface QuickMetricsProps {
  hasFinancialData: boolean;
  financialMetrics: any;
}

export const QuickMetrics: React.FC<QuickMetricsProps> = ({
  hasFinancialData,
  financialMetrics
}) => {
  if (!hasFinancialData || !financialMetrics) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Runway</p>
              <p className={`font-bold ${financialMetrics.runwayMeses < 3 ? 'text-destructive' : financialMetrics.runwayMeses < 6 ? 'text-warning' : 'text-green-600'}`}>
                {financialMetrics.runwayMeses.toFixed(1)}m
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Caixa</p>
              <p className="font-bold">
                R$ {(financialMetrics.saldoTotal / 1000).toFixed(0)}k
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Burn Rate</p>
              <p className="font-bold">
                R$ {(financialMetrics.burnRate / 1000).toFixed(0)}k
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fluxo</p>
              <p className={`font-bold ${financialMetrics.fluxoCaixa >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                R$ {(financialMetrics.fluxoCaixa / 1000).toFixed(0)}k
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
