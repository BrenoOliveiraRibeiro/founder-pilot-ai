
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";

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
    // Marcar como verificado apenas se não estiver carregando
    if (!loading) {
      setInitialCheck(true);
    }
  }, [loading]);

  // Aguardar a verificação de autenticação
  if (loading || !initialCheck) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <FounderPilotLogo className="h-12 w-12 text-primary" />
          </motion.div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Verificando autenticação...</p>
        </motion.div>
      </div>
    );
  }

  console.log("Auth state:", { user: !!user, empresas: empresas.length, path: location.pathname });

  // Se precisar de autenticação e não estiver autenticado
  if (requireAuth && !user) {
    console.log("Redirecionando para autenticação:", redirectTo);
    // Salvar origem para redirecionamento posterior
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se estiver autenticado, verificar se precisa de onboarding
  if (
    requireAuth && 
    user && 
    empresas.length === 0 && 
    !location.pathname.includes("/onboarding") && 
    !location.pathname.includes("/connect") && 
    !location.pathname.includes("/open-finance")
  ) {
    console.log("Redirecionando para onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // Se NÃO precisar de autenticação (como na página de auth) mas o usuário já estiver autenticado
  // Redirecionar para o dashboard ou onboarding conforme necessário
  if (!requireAuth && user) {
    // Se o usuário precisa completar onboarding, enviar para lá em vez do dashboard
    if (empresas.length === 0) {
      console.log("Usuário autenticado sem empresas, redirecionando para onboarding");
      return <Navigate to="/onboarding" replace />;
    }
    // Caso contrário, enviar para o dashboard
    console.log("Usuário autenticado com empresas, redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
