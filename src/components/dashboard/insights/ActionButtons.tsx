
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, TestTube } from "lucide-react";

interface ActionButtonsProps {
  onTestConnection: () => Promise<void>;
  onSyncData: () => Promise<void>;
  testingConnection: boolean;
  syncingData: boolean;
  disabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onTestConnection,
  onSyncData,
  testingConnection,
  syncingData,
  disabled
}) => {
  return (
    <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onTestConnection}
        disabled={testingConnection || disabled}
        className="w-full sm:w-auto"
      >
        {testingConnection ? 
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : 
          <TestTube className="h-4 w-4 mr-2" />
        }
        {testingConnection ? "Testando..." : "Testar Belvo"}
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onSyncData}
        disabled={syncingData || disabled}
        className="w-full sm:w-auto"
      >
        {syncingData ? 
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : 
          <RefreshCw className="h-4 w-4 mr-2" />
        }
        {syncingData ? "Analisando..." : "Analisar Dados"}
      </Button>
    </div>
  );
};
