
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
  const [empresasLoaded, setEmpresasLoaded] = useState(false);
  const { toast } = useToast();

  // Função para salvar a empresa atual no localStorage
  const setCurrentEmpresa = (empresa: Empresa) => {
    console.log("Definindo empresa atual:", empresa?.nome);
    setCurrentEmpresaState(empresa);
    if (empresa) {
      localStorage.setItem('currentEmpresaId', empresa.id);
    } else {
      localStorage.removeItem('currentEmpresaId');
    }
  };

  // Função para recuperar a empresa atual do localStorage
  const restoreCurrentEmpresa = (empresasList: Empresa[]) => {
    console.log("Restaurando empresa atual do localStorage, empresas disponíveis:", empresasList.length);
    const savedEmpresaId = localStorage.getItem('currentEmpresaId');
    
    if (savedEmpresaId && empresasList.length > 0) {
      const savedEmpresa = empresasList.find(emp => emp.id === savedEmpresaId);
      if (savedEmpresa) {
        console.log("Empresa salva encontrada:", savedEmpresa.nome);
        setCurrentEmpresaState(savedEmpresa);
        return;
      } else {
        console.log("Empresa salva não encontrada nas empresas do usuário");
      }
    }
    
    // Se não encontrar a empresa salva, usar a primeira disponível
    if (empresasList.length > 0) {
      console.log("Usando primeira empresa disponível:", empresasList[0].nome);
      setCurrentEmpresa(empresasList[0]);
    } else {
      console.log("Nenhuma empresa disponível");
      setCurrentEmpresaState(null);
      localStorage.removeItem('currentEmpresaId');
    }
  };

  const refreshProfile = async () => {
    if (!user?.id) {
      console.log("Não é possível atualizar perfil sem usuário");
      return;
    }
    
    try {
      console.log("Atualizando perfil do usuário:", user.id);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      console.log("Perfil atualizado:", profileData);
      setProfile(profileData as Profile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    }
  };

  const refreshEmpresas = async () => {
    // Usar session?.user para garantir que temos um usuário válido
    const currentUser = session?.user || user;
    
    if (!currentUser) {
      console.log("Não é possível buscar empresas sem usuário autenticado");
      setEmpresasLoaded(true);
      return;
    }
    
    try {
      console.log("Buscando empresas para o usuário:", currentUser.id);
      const { data: empresasData, error: empresasError } = await supabase
        .from('empresas')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (empresasError) {
        console.error("Erro ao buscar empresas:", empresasError);
        throw empresasError;
      }
      
      console.log("Empresas carregadas:", empresasData?.length || 0);
      const empresasList = (empresasData as Empresa[]) || [];
      setEmpresas(empresasList);
      setEmpresasLoaded(true);

      // Restaurar a empresa atual ou definir a primeira
      if (empresasList.length > 0) {
        restoreCurrentEmpresa(empresasList);
      } else {
        console.log("Usuário não possui empresas cadastradas");
        setCurrentEmpresaState(null);
        localStorage.removeItem('currentEmpresaId');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setEmpresasLoaded(true);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas empresas. Por favor, tente novamente.",
        variant: "destructive",
      });
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

    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar seus dados. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  // UseEffect para inicialização da sessão
  useEffect(() => {
    console.log("AuthProvider inicializado - verificando sessão existente");
    
    // Verificar se já existe uma sessão primeiro
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Sessão inicial:", initialSession ? "encontrada" : "não encontrada");
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      if (initialSession?.user) {
        // Buscar o perfil do usuário
        fetchUserProfile(initialSession.user.id);
      } else {
        setLoading(false);
      }
    });

    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log("Evento de autenticação:", event, newSession ? "com sessão" : "sem sessão");
        setSession(newSession);
        setUser(newSession?.user ?? null);

        // Se o usuário fizer logout, limpar os dados
        if (event === 'SIGNED_OUT') {
          console.log("Usuário fez logout - limpando dados");
          setProfile(null);
          setEmpresas([]);
          setCurrentEmpresaState(null);
          setEmpresasLoaded(false);
          localStorage.removeItem('currentEmpresaId');
          setLoading(false);
        }
        
        // Se o usuário fizer login, buscar perfil
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
          console.log("Usuário autenticado - buscando perfil");
          fetchUserProfile(newSession.user.id);
        }
      }
    );

    return () => {
      console.log("Limpando AuthProvider");
      subscription.unsubscribe();
    };
  }, []);

  // UseEffect separado para carregar empresas quando o usuário estiver disponível
  useEffect(() => {
    if (user && !empresasLoaded) {
      console.log("Usuário disponível - carregando empresas");
      refreshEmpresas();
    }
  }, [user, empresasLoaded]);

  // UseEffect para controlar o estado de loading
  useEffect(() => {
    if (user) {
      // Se temos usuário, aguardar empresas serem carregadas
      if (empresasLoaded) {
        console.log("Dados carregados - removendo loading");
        setLoading(false);
      }
    } else {
      // Se não temos usuário, não estamos loading
      setLoading(false);
    }
  }, [user, empresasLoaded]);

  const signIn = async (email: string, password: string) => {
    console.log("Tentando login para:", email);
    try {
      // Reset do estado de empresas para forçar recarregamento
      setEmpresasLoaded(false);
      setEmpresas([]);
      setCurrentEmpresaState(null);
      
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
    setEmpresasLoaded(false);
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
