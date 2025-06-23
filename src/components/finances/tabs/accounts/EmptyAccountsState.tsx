
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";

interface EmptyAccountsStateProps {
  onConnectNewAccount: () => void;
}

export const EmptyAccountsState: React.FC<EmptyAccountsStateProps> = ({
  onConnectNewAccount
}) => {
  return (
    <div className="border border-dashed rounded-lg p-6 text-center">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="font-medium mb-2">Nenhuma conta bancária conectada</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Conecte suas contas bancárias via Open Finance para ver saldos e transações em tempo real
      </p>
      <Button onClick={onConnectNewAccount}>
        <Plus className="h-4 w-4 mr-2" />
        Conectar Primeira Conta
      </Button>
    </div>
  );
};
