
import React from "react";
import { Form } from "@/components/ui/form";
import { OnboardingFooter } from "@/components/onboarding/OnboardingFooter";
import { useOnboardingForm } from "./useOnboardingForm";
import { OnboardingStepContent } from "./OnboardingStepContent";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const { isMobile, isSafariIOS } = useIsMobile();

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
          isMobile={isMobile}
          isSafariIOS={isSafariIOS}
        />
        <OnboardingFooter 
          step={step}
          totalSteps={totalSteps}
          goToPrevStep={goToPrevStep}
          goToNextStep={goToNextStep}
          onSubmit={() => form.handleSubmit(handleSubmit)()}
          isLoading={isLoading}
          isMobile={isMobile}
        />
      </form>
    </Form>
  );
};
