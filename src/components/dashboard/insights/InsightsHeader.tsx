
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart2, RefreshCw, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface InsightsHeaderProps {
  totalInsights: number;
  onRefresh: () => void;
  loading: boolean;
}

export const InsightsHeader: React.FC<InsightsHeaderProps> = ({
  totalInsights,
  onRefresh,
  loading
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart2 className="h-5 w-5 text-primary" />
          </div>
          <span>Insights Gerados por IA</span>
          {totalInsights > 0 && (
            <Badge variant="secondary" className="ml-2">
              {totalInsights}
            </Badge>
          )}
        </CardTitle>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <motion.div
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
          >
            <RefreshCw className="h-4 w-4" />
          </motion.div>
          {loading ? "Atualizando..." : "Atualizar"}
        </Button>
        
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configurar
        </Button>
      </div>
    </div>
  );
};
