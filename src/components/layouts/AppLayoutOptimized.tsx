
import React, { useState, useEffect, memo, useCallback } from "react";
import { SideNavigation } from "../navigation/SideNavigation";
import { TopNavigation } from "../navigation/TopNavigation";
import { FloatingAIButton } from "../shared/FloatingAIButton";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface AppLayoutOptimizedProps {
  children: React.ReactNode;
}

const MemoizedSideNavigation = memo(SideNavigation);
const MemoizedTopNavigation = memo(TopNavigation);
const MemoizedFloatingAIButton = memo(FloatingAIButton);

export const AppLayoutOptimized = memo<AppLayoutOptimizedProps>(({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const location = useLocation();

  const showFloatingButton = location.pathname !== "/advisor";

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200); // Reduzido de 300ms para 200ms
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <MemoizedSideNavigation />
      <div className="flex-1 flex flex-col">
        <MemoizedTopNavigation />
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            className="flex-1 p-6 overflow-y-auto"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
        {showFloatingButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.2, type: "spring" }}
          >
            <MemoizedFloatingAIButton />
          </motion.div>
        )}
      </div>
    </div>
  );
});

AppLayoutOptimized.displayName = "AppLayoutOptimized";
