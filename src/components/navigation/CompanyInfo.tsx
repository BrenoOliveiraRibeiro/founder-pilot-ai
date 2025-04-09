
import React from "react";
import { useAuth } from "@/contexts/AuthContext";

export const CompanyInfo: React.FC = () => {
  const { currentEmpresa, profile } = useAuth();

  if (!currentEmpresa) return null;

  return (
    <div className="px-3 mb-4">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm rounded-md p-3">
        <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
        <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
      </div>
    </div>
  );
};
