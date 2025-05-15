
import React, { createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Empresa, Profile } from '@/integrations/supabase/models';
import { useAuthentication } from '@/hooks/useAuthentication';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCompanyManagement } from '@/hooks/useCompanyManagement';

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
  // Use our custom hooks
  const { user, session, signIn, signUp, signOut, loading: authLoading, setLoading: setAuthLoading } = useAuthentication();
  const { profile, loading: profileLoading } = useUserProfile(user, !!session);
  const { 
    empresas, 
    currentEmpresa, 
    setCurrentEmpresa, 
    refreshEmpresas, 
    loading: companyLoading 
  } = useCompanyManagement(user, !!session);

  // Combine loading states
  const loading = authLoading || profileLoading || companyLoading;

  // Update auth loading based on other loading states
  if (!authLoading && (profileLoading || companyLoading)) {
    setAuthLoading(true);
  } else if (authLoading && !profileLoading && !companyLoading) {
    setAuthLoading(false);
  }

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
