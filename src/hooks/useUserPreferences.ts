
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserPreferences {
  selectedEmpresaId?: string;
  dashboardLayout?: string;
  theme?: string;
  language?: string;
}

export const useUserPreferences = () => {
  const { user, currentEmpresa } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({});

  // Carregar preferências do localStorage
  useEffect(() => {
    if (user?.id) {
      const savedPreferences = localStorage.getItem(`userPreferences_${user.id}`);
      if (savedPreferences) {
        try {
          const parsed = JSON.parse(savedPreferences);
          setPreferences(parsed);
        } catch (error) {
          console.error('Erro ao carregar preferências:', error);
        }
      }
    }
  }, [user?.id]);

  // Salvar preferências no localStorage
  const savePreferences = (newPreferences: Partial<UserPreferences>) => {
    if (!user?.id) return;

    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);
    
    localStorage.setItem(
      `userPreferences_${user.id}`,
      JSON.stringify(updatedPreferences)
    );
  };

  // Salvar empresa atual nas preferências
  useEffect(() => {
    if (currentEmpresa?.id && user?.id) {
      savePreferences({ selectedEmpresaId: currentEmpresa.id });
    }
  }, [currentEmpresa?.id, user?.id]);

  return {
    preferences,
    savePreferences,
  };
};
