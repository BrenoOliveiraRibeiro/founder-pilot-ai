
import { useState } from 'react';

export const useConnectionProgress = () => {
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");

  const updateProgress = (progress: number, status: string) => {
    setConnectionProgress(progress);
    setConnectionStatus(status);
  };

  const resetProgress = () => {
    setConnectionProgress(0);
    setConnectionStatus("");
  };

  return {
    connectionProgress,
    connectionStatus,
    updateProgress,
    resetProgress
  };
};
