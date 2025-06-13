
import React from 'react';
import { Info } from 'lucide-react';

export const OpenFinanceHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Open Finance</h1>
        <p className="text-muted-foreground mt-1">
          Conecte seus dados financeiros para análises do FounderPilot AI
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Info className="h-4 w-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Os dados são utilizados exclusivamente para análise
        </p>
      </div>
    </div>
  );
};
