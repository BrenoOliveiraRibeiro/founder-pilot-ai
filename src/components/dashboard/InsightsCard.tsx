
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useFinanceData } from "@/hooks/useFinanceData";
import { motion } from "framer-motion";
import { InsightsContent } from "./insights/InsightsContent";

export const InsightsCard = () => {
  const { currentEmpresa } = useAuth();
  const { loading, insights } = useFinanceData(currentEmpresa?.id || null);

  const headerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Card>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Insights Gerados por IA
          </CardTitle>
        </CardHeader>
      </motion.div>
      <CardContent>
        <InsightsContent loading={loading} insights={insights} />
      </CardContent>
    </Card>
  );
};
