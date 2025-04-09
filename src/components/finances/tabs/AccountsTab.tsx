
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export const AccountsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas Bancárias Conectadas</CardTitle>
        <CardDescription>Saldos atuais das contas bancárias integradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { bank: "Nubank", account: "Conta PJ", balance: 285000, lastUpdate: new Date() },
            { bank: "BTG Pactual", account: "Conta Investimentos", balance: 135000, lastUpdate: new Date() }
          ].map((account, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{account.bank}</h3>
                  <p className="text-sm text-muted-foreground">{account.account}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(account.balance)}</div>
                  <p className="text-xs text-muted-foreground">
                    Atualizado em {format(account.lastUpdate, "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="border border-dashed rounded-lg p-6 text-center">
            <h3 className="font-medium mb-2">Conecte mais contas bancárias</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Integramos com todas as principais instituições financeiras do Brasil
            </p>
            <Button>Conectar Nova Conta</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
