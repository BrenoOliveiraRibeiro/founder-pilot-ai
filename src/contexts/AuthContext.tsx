
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  refreshProfile: () => Promise<void>;
}

// Create context with a default value to prevent undefined errors
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  empresas: [],
  currentEmpresa: null,
  setCurrentEmpresa: () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  loading: true,
  refreshEmpresas: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [currentEmpresa, setCurrentEmpresaState] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Função para salvar a empresa atual no localStorage
  const setCurrentEmpresa = (empresa: Empresa) => {
    setCurrentEmpresaState(empresa);
    if (empresa) {
      localStorage.setItem('currentEmpresaId', empresa.id);
    } else {
      localStorage.removeItem('currentEmpresaId');
    }
  };

  // Função para recuperar a empresa atual do localStorage
  const restoreCurrentEmpresa = (empresasList: Empresa[]) => {
    const savedEmpresaId = localStorage.getItem('currentEmpresaId');
    if (savedEmpresaId && empresasList.length > 0) {
      const savedEmpresa = empresasList.find(emp => emp.id === savedEmpresaId);
      if (savedEmpresa) {
        setCurrentEmpresaState(savedEmpresa);
        return;
      }
    }
    
    // Se não encontrar a empresa salva, usar a primeira disponível
    if (empresasList.length > 0) {
      setCurrentEmpresa(empresasList[0]);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Buscando perfil do usuário:", userId);
      
      // Buscar ou criar perfil
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Perfil não existe, criar um novo
        console.log("Criando novo perfil para o usuário");
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email: user?.email || null,
              nome: user?.email?.split('@')[0] || null,
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error("Erro ao criar perfil:", createError);
          throw createError;
        }
        
        profileData = newProfile;
      } else if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
        throw profileError;
      }
      
      if (profileData) {
        console.log("Perfil encontrado/criado:", profileData);
        setProfile(profileData as Profile);
      }

      // Buscar empresas do usuário
      await refreshEmpresas();
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(profileData as Profile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const refreshEmpresas = async () => {
    if (!user) {
      console.log("Não é possível buscar empresas sem usuário autenticado");
      return;
    }
    
    try {
      console.log("Buscando empresas para o usuário:", user.id);
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (empresasError) throw empresasError;
      
      console.log("Empresas carregadas:", empresasData);
      setEmpresas(empresasData as Empresa[]);

      // Restaurar a empresa atual ou definir a primeira
      if (empresasData && empresasData.length > 0) {
        restoreCurrentEmpresa(empresasData as Empresa[]);
      } else {
        setCurrentEmpresaState(null);
        localStorage.removeItem('currentEmpresaId');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas empresas. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("AuthProvider inicializado");
    
    // Verificar se já existe uma sessão primeiro
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Sessão existente:", session ? "sim" : "não");
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Buscar o perfil e empresas do usuário
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

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
          setCurrentEmpresaState(null);
          localStorage.removeItem('currentEmpresaId');
          setLoading(false);
        }
        
        // Se o usuário fizer login, buscar perfil e empresas
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          fetchUserProfile(session.user.id);
        }
      }
    );

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
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      console.log("Resposta de cadastro:", data ? "sucesso" : "falha", error);
      return { error };
    } catch (error) {
      console.error("Erro ao fazer cadastro:", error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log("Iniciando logout");
    // Limpar dados locais antes do logout
    localStorage.removeItem('currentEmpresaId');
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
    refreshEmpresas,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  // Remove the error throwing since we now have a default context value
  return context;
};
