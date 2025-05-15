
import { useState, useEffect } from 'react';
import { fromEmpresas } from '@/integrations/supabase/typedClient';
import { Empresa } from '@/integrations/supabase/models';
import { User } from '@supabase/supabase-js';

export const useCompanyManagement = (user: User | null, isAuthenticated: boolean) => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [currentEmpresa, setCurrentEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshEmpresas = async () => {
    if (!user || !isAuthenticated) {
      console.log("Não é possível buscar empresas sem usuário autenticado");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Buscando empresas para o usuário:", user.id);
      const { data: empresasData, error: empresasError } = await fromEmpresas()
        .select('*')
        .eq('user_id', user.id);

      if (empresasError) {
        console.error("Erro ao buscar empresas:", empresasError);
        return; // Retorna sem lançar erro, apenas registra no console
      }
      
      console.log("Empresas carregadas:", empresasData);
      setEmpresas(empresasData as Empresa[] || []);

      // Se houver empresas, definir a primeira como atual se nenhuma for selecionada
      if (empresasData && empresasData.length > 0 && !currentEmpresa) {
        console.log("Definindo empresa atual:", empresasData[0]);
        setCurrentEmpresa(empresasData[0] as Empresa);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAuthenticated) {
      refreshEmpresas();
    } else {
      setEmpresas([]);
      setCurrentEmpresa(null);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  return {
    empresas,
    currentEmpresa,
    setCurrentEmpresa,
    refreshEmpresas,
    loading
  };
};
