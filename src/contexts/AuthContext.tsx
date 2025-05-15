
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fromProfiles, fromEmpresas } from '@/integrations/supabase/typedClient';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { Empresa, Profile } from '@/integrations/supabase/models';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  empresas: Empresa[];
  currentEmpresa: Empresa | null;
  setCurrentEmpresa: (empresa: Empresa) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshEmpresas: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [currentEmpresa, setCurrentEmpresa] = useState<Empresa | null>(null);
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

      // Buscar empresas
      await refreshEmpresas();
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // Não mostrar toast aqui para evitar spam de mensagens
    } finally {
      setLoading(false);
    }
  };

  const refreshEmpresas = async () => {
    if (!user) {
      console.log("Não é possível buscar empresas sem usuário autenticado");
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
      // Não vamos mostrar toast aqui para evitar spam
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
    console.log("AuthProvider inicializado");
    // Verificar se as tabelas necessárias existem
    checkAndCreateProfilesTable();
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        setSession(session);
        setUser(session?.user ?? null);

        // Se o usuário fizer logout, limpar os dados
        if (event === 'SIGNED_OUT') {
          setProfile(null);
          setEmpresas([]);
          setCurrentEmpresa(null);
        }
        
        // Se o usuário fizer login, buscar perfil e empresas
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          // Pequena pausa para evitar conflitos com outras operações do Supabase
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        }
      }
    );

    // Verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Sessão existente:", session ? "sim" : "não");
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar o perfil e empresas do usuário
        // Pequena pausa para evitar conflitos com outras operações do Supabase
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log("Limpando AuthProvider");
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Tentando login para:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log("Resposta de login:", data ? "sucesso" : "falha", error);
      return { error };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string) => {
    console.log("Tentando cadastro para:", email);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log("Resposta de cadastro:", data ? "sucesso" : "falha", error);
      return { error };
    } catch (error) {
      console.error("Erro ao fazer cadastro:", error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("Iniciando logout");
    await supabase.auth.signOut();
    console.log("Logout concluído");
  };

  const value = {
    session,
    user,
    profile,
    empresas,
    currentEmpresa,
    setCurrentEmpresa,
    signIn,
    signUp,
    signOut,
    loading,
    refreshEmpresas
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
