
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IntroAnimation } from "@/components/shared/IntroAnimation";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, empresas } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!loading && !showIntro) {
      if (user) {
        // Se o usuário está autenticado mas não tem empresa, enviar para onboarding
        if (empresas.length === 0) {
          navigate("/onboarding");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/auth");
      }
    }
  }, [navigate, user, loading, showIntro, empresas]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-background/95">
      <motion.div 
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FounderPilotLogo className="h-8 w-8 text-foreground" />
          <h1 className="text-3xl font-bold">FounderPilot</h1>
        </motion.div>
        
        <FriendlyLoadingMessage isLoading={true} className="mt-2" />
      </motion.div>
    </div>
  );
};

export default Index;
