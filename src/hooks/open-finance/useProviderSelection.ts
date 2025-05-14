
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export const useProviderSelection = (providers: any[]) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [useSandbox, setUseSandbox] = useState(false);
  const { toast } = useToast();

  // Auto-select first provider if none selected
  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      setSelectedProvider(providers[0].id);
    }
  }, [providers, selectedProvider]);

  const validateProviderSelection = () => {
    if (!selectedProvider) {
      toast({
        title: "Erro",
        description: "Selecione um banco para continuar.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  return {
    selectedProvider, 
    setSelectedProvider,
    useSandbox,
    setUseSandbox,
    validateProviderSelection
  };
};
