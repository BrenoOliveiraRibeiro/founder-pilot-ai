
import { useState, useEffect } from "react";

export const useBelvoWidget = () => {
  const [belvoWidgetLoaded, setBelvoWidgetLoaded] = useState(false);

  useEffect(() => {
    // Load the Belvo widget script
    if (!document.getElementById("belvo-script")) {
      const script = document.createElement("script");
      script.id = "belvo-script";
      script.src = "https://cdn.belvo.io/belvo-widget-1-stable.js";
      script.async = true;
      script.onload = () => setBelvoWidgetLoaded(true);
      document.head.appendChild(script);
      console.log("Belvo SDK script loaded");
    } else {
      setBelvoWidgetLoaded(true);
    }
    
    return () => {
      // Cleanup function - no need to remove the script
      // as it should persist between component mounts
    };
  }, []);

  return { belvoWidgetLoaded };
};
