
import React from "react";

interface FounderPilotLogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const FounderPilotLogo = ({ 
  className = "h-5 w-5", 
  showText = false,
  textClassName = "text-xl font-semibold"
}: FounderPilotLogoProps) => {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/lovable-uploads/75dab371-2220-44b3-84fa-09860154e30a.png" 
        alt="FounderPilot AI" 
        className={className}
      />
      {showText && (
        <span className={`text-foreground ${textClassName}`}>
          Founder Pilot AI
        </span>
      )}
    </div>
  );
};
