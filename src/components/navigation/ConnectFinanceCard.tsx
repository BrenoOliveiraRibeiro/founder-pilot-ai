
import React from "react";
import { Link } from "react-router-dom";

export const ConnectFinanceCard: React.FC = () => {
  return (
    <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-primary/3 backdrop-blur-sm p-3 mb-3">
      <h3 className="font-medium text-sm text-primary mb-1 flex items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse-subtle"></span>
        Conecte seus dados
      </h3>
      <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
        Vincule suas contas financeiras para desbloquear insights mais precisos
      </p>
      <Link 
        to="/open-finance"
        className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-md inline-flex items-center justify-center w-full font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
      >
        Conectar Open Finance
      </Link>
    </div>
  );
};
