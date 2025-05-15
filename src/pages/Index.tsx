import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IntroAnimation } from "@/components/shared/IntroAnimation";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "@/components/shared/FounderPilotLogo";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { TestimonialSection } from "@/components/landing/TestimonialSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, empresas } = useAuth();
  const [showIntro, setShowIntro] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Simular menos tempo de carregamento da animação em desenvolvimento
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Se carregamento da autenticação terminou e não está mostrando introdução
    if (!loading && !showIntro) {
      setCheckingAuth(false);
      
      if (user) {
        console.log("Usuário autenticado:", user.email);
        console.log("Empresas:", empresas.length);
        
        // Se o usuário está autenticado mas não tem empresa, enviar para onboarding
        if (empresas.length === 0) {
          console.log("Redirecionando para onboarding");
          navigate("/onboarding");
        } else {
          console.log("Redirecionando para dashboard");
          navigate("/dashboard");
        }
      } else {
        console.log("Usuário não autenticado, permanecendo na landing page");
      }
    }
  }, [navigate, user, loading, showIntro, empresas]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const goToAuth = () => {
    navigate("/auth");
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  // Se ainda está verificando autenticação, mostrar loader
  if (checkingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-background/95">
        <motion.div 
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FounderPilotLogo className="h-16 w-auto text-foreground" />
          </motion.div>
          
          <FriendlyLoadingMessage isLoading={true} className="mt-2" />
        </motion.div>
      </div>
    );
  }

  // Se não está autenticado, mostrar landing page com botão mais destacado para login
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center">
          <FounderPilotLogo className="h-12 w-auto text-foreground" />
        </div>
        <Button 
          onClick={goToAuth} 
          size="lg"
          className="bg-primary hover:bg-primary/90 text-white px-8 py-6 font-medium flex items-center"
        >
          Acessar Plataforma <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialSection />
      <FooterSection />
    </div>
  );
};

export default Index;
