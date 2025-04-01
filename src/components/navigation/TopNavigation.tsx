
import React from "react";
import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const TopNavigation = () => {
  return (
    <header className="border-b border-border py-3 px-6 bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center w-72">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pl-9 bg-background h-9"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-foreground/80">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium hidden sm:inline">
              Founder
            </span>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
