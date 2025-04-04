
import React, { useState, useEffect } from "react";
import { SideNavigation } from "../navigation/SideNavigation";
import { TopNavigation } from "../navigation/TopNavigation";
import { FloatingAIButton } from "../shared/FloatingAIButton";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  // Simple page transition effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Don't show floating button on the advisor page
  const showFloatingButton = location.pathname !== "/advisor";

  return (
    <div className="min-h-screen bg-background flex">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <TopNavigation />
        <main className={`flex-1 p-6 overflow-y-auto transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </main>
        {showFloatingButton && <FloatingAIButton />}
      </div>
    </div>
  );
};
