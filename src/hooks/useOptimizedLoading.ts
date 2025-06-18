
import { useState, useEffect, useCallback } from "react";

interface UseOptimizedLoadingOptions {
  initialDelay?: number;
  minLoadingTime?: number;
}

export const useOptimizedLoading = (
  loadingStates: boolean[] = [],
  options: UseOptimizedLoadingOptions = {}
) => {
  const { initialDelay = 0, minLoadingTime = 500 } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const hasAnyLoading = loadingStates.some(state => state);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    const checkAndSetLoading = async () => {
      if (!hasAnyLoading) {
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);
        
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }
        
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }
    };

    if (initialDelay > 0) {
      const timer = setTimeout(checkAndSetLoading, initialDelay);
      return () => clearTimeout(timer);
    } else {
      checkAndSetLoading();
    }
  }, [hasAnyLoading, startTime, initialDelay, minLoadingTime]);

  const forceComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return { isLoading, forceComplete };
};
