
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { IntroAnimation } from "@/components/shared/IntroAnimation";
import { FriendlyLoadingMessage } from "@/components/ui/friendly-loading-message";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    if (!loading && !showIntro) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [navigate, user, loading, showIntro]);

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-2xl">FP</span>
        </div>
        <h1 className="text-2xl font-bold">FounderPilot AI</h1>
        <FriendlyLoadingMessage isLoading={true} className="mt-4" />
      </div>
    </div>
  );
};

export default Index;
