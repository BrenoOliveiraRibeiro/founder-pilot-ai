
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { EmpresaInfoForm, empresaFormSchema } from "@/components/onboarding/EmpresaInfoForm";
import { LogoStep } from "@/components/onboarding/LogoStep";
import { DocumentsStep } from "@/components/onboarding/DocumentsStep";

type EmpresaFormValues = z.infer<typeof empresaFormSchema>;

interface OnboardingStepContentProps {
  step: number;
  form: UseFormReturn<EmpresaFormValues>;
  logoPreview: string;
  documents: Array<{ file: File, preview?: string }>;
  onLogoChange: (file: File | null, previewUrl: string) => void;
  onDocumentChange: (file: File) => void;
  onRemoveDocument: (index: number) => void;
}

export const OnboardingStepContent: React.FC<OnboardingStepContentProps> = ({
  step,
  form,
  logoPreview,
  documents,
  onLogoChange,
  onDocumentChange,
  onRemoveDocument
}) => {
  switch (step) {
    case 1:
      return <EmpresaInfoForm form={form} />;
    case 2:
      return <LogoStep onLogoChange={onLogoChange} existingLogo={logoPreview} />;
    case 3:
      return (
        <DocumentsStep
          onDocumentChange={onDocumentChange}
          documents={documents}
          onRemoveDocument={onRemoveDocument}
        />
      );
    default:
      return null;
  }
};
