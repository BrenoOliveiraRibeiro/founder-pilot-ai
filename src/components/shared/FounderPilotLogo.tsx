
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
        src="/lovable-uploads/1ed26c5b-6150-4a9e-a059-199df5821ef8.png" 
        alt="Synapsia" 
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
