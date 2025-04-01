
import React from "react";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ConnectBankSection } from "@/components/onboarding/ConnectBankSection";

const Connect = () => {
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Connect Your Financial Data</h1>
        <ConnectBankSection />
      </div>
    </AppLayout>
  );
};

export default Connect;
