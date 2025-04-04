
import React from "react";
import { Check } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  logo: string;
  popular: boolean;
}

interface ProvidersListProps {
  providers: Provider[];
  selectedProvider: string | null;
  setSelectedProvider: (provider: string) => void;
}

export const ProvidersList = ({ 
  providers, 
  selectedProvider, 
  setSelectedProvider 
}: ProvidersListProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`border rounded-md p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${
            selectedProvider === provider.id 
              ? "border-primary bg-primary/5 shadow-sm" 
              : "hover:border-primary/30 hover:bg-accent/5"
          }`}
          onClick={() => setSelectedProvider(provider.id)}
        >
          <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold">
            {provider.logo}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{provider.name}</div>
            {provider.popular && (
              <div className="text-xs text-muted-foreground">Popular</div>
            )}
          </div>
          {selectedProvider === provider.id && (
            <Check className="h-4 w-4 text-primary" />
          )}
        </div>
      ))}
    </div>
  );
};
