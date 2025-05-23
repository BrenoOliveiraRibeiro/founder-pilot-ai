
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { PRODUCTION_PJ_PROVIDERS } from '@/components/open-finance/BankProviders';

export const useProviderSelection = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  // Removido useSandbox - sempre produção
  const { toast } = useToast();

  // Sempre usar conectores de produção PJ
  const providers = PRODUCTION_PJ_PROVIDERS;

  // Auto-select first popular provider if none selected
  useEffect(() => {
    if (providers.length > 0 && !selectedProvider) {
      const firstPopular = providers.find(p => p.popular) || providers[0];
      setSelectedProvider(firstPopular.id);
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
    useSandbox: false, // Sempre produção
    setUseSandbox: () => {}, // Função vazia para compatibilidade
    validateProviderSelection,
    providers
  };
};
