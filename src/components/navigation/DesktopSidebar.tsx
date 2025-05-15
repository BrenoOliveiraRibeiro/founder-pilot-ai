
import React from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FounderPilotLogo } from "../shared/FounderPilotLogo";
import { CompanyInfo } from "./CompanyInfo";
import { ConnectFinanceCard } from "./ConnectFinanceCard";
import { NavGroupsList } from "./NavGroups";
import { NavGroups } from "./types";

interface DesktopSidebarProps {
  groupedNavItems: NavGroups;
  onSignOut: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  groupedNavItems,
  onSignOut 
}) => {
  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.aside 
      className="w-64 bg-gradient-to-b from-background to-background/90 border-r border-border h-screen flex flex-col"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      <div className="p-6">
        <Link to="/" className="flex items-center justify-center mb-2 group hover:opacity-90 transition-opacity">
          <div className="flex items-center gap-2">
            <FounderPilotLogo className="h-10 w-auto text-foreground" />
            <h1 className="text-xl font-bold">FounderPilot</h1>
          </div>
        </Link>
      </div>

      <CompanyInfo />

      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-none">
        <NavGroupsList groupedItems={groupedNavItems} />
      </nav>

      <div className="p-4 border-t border-border">
        <ConnectFinanceCard />
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground/80"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </motion.aside>
  );
};
