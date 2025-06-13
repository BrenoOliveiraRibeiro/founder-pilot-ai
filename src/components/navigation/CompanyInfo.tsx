
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building, User } from "lucide-react";

export const CompanyInfo: React.FC = () => {
  const { currentEmpresa, profile, user } = useAuth();

  if (!currentEmpresa) return null;

  return (
    <div className="px-3 mb-4">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm rounded-md p-3 space-y-2">
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <p className="text-xs text-muted-foreground truncate">
            {profile?.nome || user?.email?.split('@')[0] || 'Usuário'}
          </p>
        </div>
        
        {currentEmpresa.segmento && (
          <p className="text-xs text-muted-foreground/80 truncate">
            {currentEmpresa.segmento}
          </p>
        )}
      </div>
    </div>
  );
};
