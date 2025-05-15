
import React from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { FounderPilotLogo } from "../shared/FounderPilotLogo";
import { CompanyInfo } from "./CompanyInfo";
import { ConnectFinanceCard } from "./ConnectFinanceCard";
import { NavGroupsList } from "./NavGroups";
import { navItems } from "./types";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignOut: () => void;
  groupedNavItems: Record<string, any[]>;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  open, 
  onOpenChange, 
  onSignOut,
  groupedNavItems
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-72">
        <div className="flex flex-col h-full">
          <div className="p-6">
            <Link to="/" className="flex items-center justify-center mb-2 group hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-2">
                <FounderPilotLogo className="h-10 w-auto text-foreground" />
                <h1 className="text-xl font-bold">FounderPilot</h1>
              </div>
            </Link>
          </div>

          <CompanyInfo />

          <nav className="flex-1 px-3 py-2 overflow-y-auto">
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
        </div>
      </SheetContent>
    </Sheet>
  );
};
