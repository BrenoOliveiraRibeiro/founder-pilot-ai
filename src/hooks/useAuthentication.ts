
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';

export const useAuthentication = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Authentication hook initialized");
    
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Se o usuário fizer logout, o contexto de empresa vai limpar os dados
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, clearing session data");
        }
      }
    );

    // Verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Sessão existente:", session ? "sim" : "não");
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        setLoading(false);
      }
    });

    return () => {
      console.log("Cleaning up auth subscription");
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

  return {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    setLoading
  };
};
