
import React from "react";
import { LogoUpload } from "./LogoUpload";

interface LogoStepProps {
  onLogoChange: (file: File | null, previewUrl: string) => void;
  existingLogo?: string;
  isMobile?: boolean;
  isSafariIOS?: boolean;
}

export const LogoStep: React.FC<LogoStepProps> = ({ 
  onLogoChange, 
  existingLogo, 
  isMobile, 
  isSafariIOS 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`${isMobile ? 'text-lg' : 'text-lg'} font-medium mb-2`}>Logo da empresa</h3>
        <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-muted-foreground mb-4`}>
          Adicione a logo da sua empresa para personalizar sua experiência
        </p>
      </div>
      <LogoUpload 
        onLogoChange={onLogoChange} 
        existingLogo={existingLogo} 
        isMobile={isMobile}
        isSafariIOS={isSafariIOS}
      />
    </div>
  );
};
