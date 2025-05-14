
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { SANDBOX_PROVIDERS, REAL_PROVIDERS } from '@/components/open-finance/BankProviders';

export const useProviderSelection = (initialSandboxMode = false) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [useSandbox, setUseSandbox] = useState(initialSandboxMode);
  const { toast } = useToast();

  // Get the appropriate providers based on sandbox mode
  const providers = useSandbox ? SANDBOX_PROVIDERS : REAL_PROVIDERS;

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
    validateProviderSelection,
    providers // Export providers so it can be used by consumer components
  };
};
