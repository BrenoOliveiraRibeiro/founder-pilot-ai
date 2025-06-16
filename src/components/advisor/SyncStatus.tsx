
import React from "react";
import { motion } from "framer-motion";

interface SyncStatusProps {
  hasFinancialData: boolean;
  ultimaAtualizacao?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  hasFinancialData,
  ultimaAtualizacao
}) => {
  if (!hasFinancialData || !ultimaAtualizacao) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-center"
    >
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Dados sincronizados • {new Date(ultimaAtualizacao).toLocaleString('pt-BR')}
      </p>
    </motion.div>
  );
};
