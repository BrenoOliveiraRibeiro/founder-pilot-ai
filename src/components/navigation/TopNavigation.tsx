
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { BanknoteIcon, CircuitBoard, LogOut, Settings, Sparkles } from "lucide-react";

export const TopNavigation = () => {
  const { user, signOut, currentEmpresa } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const userDisplayName = user?.email?.split("@")[0] || "Usuário";

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
          <Link to="/dashboard" className="hidden items-center gap-2 md:flex">
            <CircuitBoard className="h-6 w-6" />
            <span className="text-xl font-bold tracking-tight">
              {currentEmpresa?.nome || "FounderPilot AI"}
            </span>
          </Link>
          <nav className="flex items-center gap-4 lg:gap-6">
            <Link
              to="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              to="/open-finance"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <div className="flex items-center gap-1">
                <BanknoteIcon className="h-4 w-4" />
                Open Finance
              </div>
            </Link>
            <Link
              to="/advisor"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                FounderPilot AI
              </div>
            </Link>
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={userDisplayName} />
                  <AvatarFallback>{getInitials(userDisplayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {userDisplayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
