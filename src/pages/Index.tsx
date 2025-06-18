
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

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Simular menos tempo de carregamento da animação em desenvolvimento
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Só redirecionar usuários autenticados após intro finalizada
    if (!loading && !showIntro && user) {
      console.log("Usuário autenticado detectado, redirecionando para dashboard");
      navigate("/dashboard");
    }
  }, [navigate, user, loading, showIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  // Se ainda está verificando autenticação, mostrar loader
  if (loading) {
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
  }

  // Para usuários não autenticados, mostrar landing page
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <TestimonialSection />
      <FooterSection />
    </div>
  );
};

export default Index;
