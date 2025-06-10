
import React from "react";
import { Form } from "@/components/ui/form";
import { EmpresaInfoForm } from "@/components/onboarding/EmpresaInfoForm";
import { LogoStep } from "@/components/onboarding/LogoStep";
import { DocumentsStep } from "@/components/onboarding/DocumentsStep";
import { OnboardingFooter } from "@/components/onboarding/OnboardingFooter";
import { useOnboardingForm } from "./useOnboardingForm";
import { OnboardingStepContent } from "./OnboardingStepContent";

export const OnboardingForm = () => {
  const {
    form,
    step,
    totalSteps,
    isLoading,
    logoPreview,
    documents,
    handleLogoChange,
    handleDocumentChange,
    handleRemoveDocument,
    goToNextStep,
    goToPrevStep,
    handleSubmit
  } = useOnboardingForm();

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <OnboardingStepContent 
          step={step}
          form={form}
          logoPreview={logoPreview}
          documents={documents}
          onLogoChange={handleLogoChange}
          onDocumentChange={handleDocumentChange}
          onRemoveDocument={handleRemoveDocument}
        />
        <OnboardingFooter 
          step={step}
          totalSteps={totalSteps}
          goToPrevStep={goToPrevStep}
          goToNextStep={goToNextStep}
          onSubmit={() => form.handleSubmit(handleSubmit)()}
          isLoading={isLoading}
        />
      </form>
    </Form>
  );
};
