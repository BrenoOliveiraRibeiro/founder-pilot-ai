
import React from "react";
import { LogoUpload } from "./LogoUpload";

interface LogoStepProps {
  onLogoChange: (file: File | null, previewUrl: string) => void;
  existingLogo?: string;
}

export const LogoStep: React.FC<LogoStepProps> = ({ onLogoChange, existingLogo }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Logo da empresa</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Adicione a logo da sua empresa para personalizar sua experiência
        </p>
      </div>
      <LogoUpload onLogoChange={onLogoChange} existingLogo={existingLogo} />
    </div>
  );
};
