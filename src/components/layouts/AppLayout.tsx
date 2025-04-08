
import React, { useState, useEffect } from "react";
import { SideNavigation } from "../navigation/SideNavigation";
import { TopNavigation } from "../navigation/TopNavigation";
import { FloatingAIButton } from "../shared/FloatingAIButton";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Page transition effect
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Don't show floating button on the advisor page
  const showFloatingButton = location.pathname !== "/advisor";

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-background flex overflow-hidden">
      <SideNavigation />
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {!isMobile && <TopNavigation />}
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            className="flex-1 p-4 md:p-6 overflow-y-auto"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
        {showFloatingButton && 
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3, type: "spring" }}
          >
            <FloatingAIButton />
          </motion.div>
        }
      </div>
    </div>
  );
};
