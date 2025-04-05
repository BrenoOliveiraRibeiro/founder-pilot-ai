
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ActionButtonsProps {
  onSyncData: () => Promise<void>;
  syncingData: boolean;
  disabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSyncData,
  syncingData,
  disabled
}) => {
  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onSyncData}
        disabled={syncingData || disabled}
        className="w-full sm:w-auto rounded-full px-4"
      >
        {syncingData ? 
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : 
          <RefreshCw className="h-4 w-4 mr-2" />
        }
        {syncingData ? "Analisando..." : "Atualizar Dados"}
      </Button>
    </div>
  );
};
