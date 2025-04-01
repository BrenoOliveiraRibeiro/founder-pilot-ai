
import React from "react";
import { SideNavigation } from "../navigation/SideNavigation";
import { TopNavigation } from "../navigation/TopNavigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex">
      <SideNavigation />
      <div className="flex-1 flex flex-col">
        <TopNavigation />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
