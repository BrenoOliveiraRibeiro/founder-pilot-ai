
import React from "react";
import { Shield, Database, Building } from "lucide-react";

export const SecurityInfoItems = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-sm">
        <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          <p className="font-medium">Conexão segura via Open Finance</p>
          <p className="text-muted-foreground">Você será redirecionado para o site do seu banco para autorizar o compartilhamento de dados.</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2 text-sm">
        <Database className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          <p className="font-medium">Acesso somente leitura</p>
          <p className="text-muted-foreground">Teremos acesso apenas à leitura de seus dados, sem permissão para realizar transações.</p>
        </div>
      </div>
      
      <div className="flex items-start gap-2 text-sm">
        <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
        <div>
          <p className="font-medium">Dados empresariais</p>
          <p className="text-muted-foreground">Será necessário selecionar sua conta PJ durante o processo de autorização.</p>
        </div>
      </div>
    </div>
  );
};
