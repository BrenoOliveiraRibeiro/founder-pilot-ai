
import { useState, useEffect } from 'react';
import { fromProfiles } from '@/integrations/supabase/typedClient';
import { Profile } from '@/integrations/supabase/models';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export const useUserProfile = (user: User | null, isAuthenticated: boolean) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Buscando perfil do usuário:", userId);
      
      // Buscar perfil
      const { data: profileData, error: profileError } = await fromProfiles()
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        // Não vamos lançar o erro aqui, apenas registrar
      }
      
      if (profileData) {
        console.log("Perfil encontrado:", profileData);
        setProfile(profileData as Profile);
      } else {
        console.log("Perfil não encontrado, criando um novo perfil");
        
        // Criar um perfil básico se não existir
        if (user?.email) {
          const { data: newProfile, error: createError } = await fromProfiles()
            .insert([{ id: userId, email: user.email }])
            .select()
            .maybeSingle();
            
          if (createError) {
            console.error("Erro ao criar perfil:", createError);
          } else if (newProfile) {
            console.log("Novo perfil criado:", newProfile);
            setProfile(newProfile as Profile);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Esta função verifica se é necessário criar a tabela profiles caso não exista
  const checkAndCreateProfilesTable = async () => {
    try {
      // Verifica se a tabela existe fazendo um select
      const { error } = await fromProfiles()
        .select('count', { count: 'exact', head: true });

      // Se não houver erro, a tabela existe
      if (!error) return;

      // Se o erro for que a tabela não existe, podemos informar o usuário
      if (error.code === '42P01') { // código postgres para "tabela não existe"
        console.error("A tabela profiles não existe. Por favor, execute as migrações necessárias.");
        toast({
          title: "Configuração incompleta",
          description: "As tabelas necessárias não foram encontradas. Contate o administrador do sistema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao verificar tabela profiles:", error);
    }
  };

  useEffect(() => {
    // Verificar se a tabela profiles existe
    checkAndCreateProfilesTable();
    
    if (user && isAuthenticated) {
      // Pequeno atraso para evitar corridas com outras operações do Supabase
      setTimeout(() => {
        fetchUserProfile(user.id);
      }, 0);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  return {
    profile,
    loading,
    setLoading
  };
};
