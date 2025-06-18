
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, AuthError } from '@supabase/supabase-js';
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
  const [isInitialized, setIsInitialized] = useState(false);
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

  // Função para inicializar dados do usuário (perfil + empresas)
  const initializeUserData = async (currentUser: User) => {
    try {
      console.log("Inicializando dados do usuário:", currentUser.id);
      
      // Buscar perfil e empresas em paralelo
      await Promise.all([
        fetchUserProfile(currentUser.id),
        refreshEmpresas()
      ]);
      
      console.log("Dados do usuário inicializados com sucesso");
    } catch (error) {
      console.error('Erro ao inicializar dados do usuário:', error);
    } finally {
      setIsInitialized(true);
      setLoading(false);
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
        // Inicializar dados do usuário
        initializeUserData(initialSession.user);
      } else {
        setIsInitialized(true);
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
          localStorage.removeItem('currentEmpresaId');
          setIsInitialized(true);
          setLoading(false);
        }
        
        // Se o usuário fizer login, buscar dados
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && newSession?.user) {
          console.log("Usuário autenticado - inicializando dados");
          setIsInitialized(false);
          setLoading(true);
          initializeUserData(newSession.user);
        }
      }
    );

    return () => {
      console.log("Limpando AuthProvider");
      subscription.unsubscribe();
    };
  }, []);

  const getAuthErrorMessage = (error: AuthError): string => {
    // Tratar erros específicos de autenticação
    if (error.message.includes('Invalid login credentials')) {
      return 'Email ou senha incorretos. Verifique se você confirmou seu email.';
    }
    
    if (error.message.includes('Email not confirmed')) {
      return 'Por favor, confirme seu email antes de fazer login.';
    }
    
    if (error.message.includes('User already registered')) {
      return 'Este email já está cadastrado. Use a opção de login.';
    }
    
    if (error.message.includes('Signup requires email confirmation')) {
      return 'Cadastro realizado! Verifique seu email para confirmar a conta.';
    }
    
    // Retornar mensagem original se não for um erro conhecido
    return error.message;
  };

  const signIn = async (email: string, password: string) => {
    console.log("Tentando login para:", email);
    try {
      // Reset do estado para forçar recarregamento
      setIsInitialized(false);
      setEmpresas([]);
      setCurrentEmpresaState(null);
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setLoading(false);
        setIsInitialized(true);
        // Retornar erro com mensagem amigável
        return { error: { ...error, message: getAuthErrorMessage(error) } };
      }
      
      console.log("Resposta de login:", data ? "sucesso" : "falha");
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      setLoading(false);
      setIsInitialized(true);
      return { error: { ...error, message: getAuthErrorMessage(error) } };
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
      
      if (error) {
        return { error: { ...error, message: getAuthErrorMessage(error) } };
      }
      
      console.log("Resposta de cadastro:", data ? "sucesso" : "falha");
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao fazer cadastro:", error);
      return { error: { ...error, message: getAuthErrorMessage(error) } };
    }
  };

  const signOut = async () => {
    console.log("Iniciando logout");
    // Limpar dados locais antes do logout
    localStorage.removeItem('currentEmpresaId');
    setIsInitialized(false);
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
    loading: loading || !isInitialized,
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
