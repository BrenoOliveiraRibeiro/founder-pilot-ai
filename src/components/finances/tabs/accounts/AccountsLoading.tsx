
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AccountsLoading: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contas Bancárias Conectadas</CardTitle>
        <CardDescription>Saldos atuais das contas bancárias integradas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="p-4 rounded-lg border">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
