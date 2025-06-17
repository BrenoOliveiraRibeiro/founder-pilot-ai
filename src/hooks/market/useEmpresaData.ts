
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useEmpresaData = () => {
  const [empresaData, setEmpresaData] = useState<any>(null);

  useEffect(() => {
    const fetchEmpresaData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: empresas, error } = await supabase
            .from('empresas')
            .select('*')
            .eq('user_id', session.user.id)
            .maybeSingle();
            
          if (error) {
            console.error("Erro ao buscar dados da empresa:", error);
            return;
          }
          
          if (empresas) {
            setEmpresaData(empresas);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };
    
    fetchEmpresaData();
  }, []);

  return {
    empresaData
  };
};
