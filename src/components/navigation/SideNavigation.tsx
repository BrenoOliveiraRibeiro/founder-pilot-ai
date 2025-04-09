
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { navItems } from "./types";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileSidebar } from "./MobileSidebar";

export const SideNavigation = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const { toast } = useToast();

  // Agrupar itens de navegação
  const groupedNavItems = navItems.reduce((groups, item) => {
    const group = item.group || 'outros';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, typeof navItems>);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return (
    <>
      <DesktopSidebar 
        groupedNavItems={groupedNavItems}
        onSignOut={handleSignOut}
      />
      
      <MobileSidebar 
        open={isMobileNavOpen}
        onOpenChange={setIsMobileNavOpen}
        onSignOut={handleSignOut}
        groupedNavItems={groupedNavItems}
      />
    </>
  );
};
