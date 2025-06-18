
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Zap, Building2 } from "lucide-react";

interface BankConnectionCardProps {
  onConnectClick: () => void;
  isLoading?: boolean;
}

export const BankConnectionCard: React.FC<BankConnectionCardProps> = ({
  onConnectClick,
  isLoading = false
}) => {
  return (
    <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 to-blue-50/30" />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
              <img 
                src="https://media.licdn.com/dms/image/v2/C560BAQGbP3joPjasLw/company-logo_200_200/company-logo_200_200/0/1630665861354/pluggyai_logo?e=2147483647&v=beta&t=k1PIBzxSkL0wxz2q1R4RcjhiZ3JQhnyQQom2NQtfk1Y"
                alt="Pluggy OpenFinance"
                className="w-8 h-8 object-contain filter brightness-0 invert"
                onError={(e) => {
                  // Fallback para ícone se a imagem não carregar
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const iconElement = document.createElement('div');
                  iconElement.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
                  target.parentNode?.appendChild(iconElement);
                }}
              />
            </div>
            <div>
              <CardTitle className="text-lg">Pluggy OpenFinance</CardTitle>
              <CardDescription>
                Conexão segura e certificada pelo Banco Central
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            Certificado
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-muted-foreground">Criptografia bancária</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-muted-foreground">Sincronização automática</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-muted-foreground">+300 instituições</span>
          </div>
        </div>
        
        <div className="pt-2">
          <Button 
            onClick={onConnectClick}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium"
          >
            {isLoading ? "Conectando..." : "Conectar Conta Bancária"}
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          Seus dados são protegidos com o mesmo nível de segurança usado pelos bancos
        </p>
      </CardContent>
    </Card>
  );
};
