
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  children,
  requireAuth = true,
  redirectTo = "/auth",
}: ProtectedRouteProps) => {
  const { user, loading, empresas } = useAuth();
  const location = useLocation();
  const [initialCheck, setInitialCheck] = useState(false);

  useEffect(() => {
    if (!loading) {
      setInitialCheck(true);
    }
  }, [loading]);

  // Aguardar a verificação de autenticação
  if (loading || !initialCheck) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se precisar de autenticação e não estiver autenticado
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se estiver autenticado, verificar se precisa de onboarding
  // Importante: Não redirecionar para onboarding se o usuário estiver no próprio onboarding ou nas páginas de conexão
  if (
    requireAuth && 
    user && 
    empresas.length === 0 && 
    !location.pathname.includes("/onboarding") && 
    !location.pathname.includes("/connect") && 
    !location.pathname.includes("/open-finance")
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Se NÃO precisar de autenticação (como na página de auth) mas o usuário já estiver autenticado
  // Redirecionar para o dashboard
  if (!requireAuth && user) {
    // Se o usuário precisa completar onboarding, enviar para lá em vez do dashboard
    if (empresas.length === 0) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
