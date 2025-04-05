
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
import { motion } from "framer-motion";

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
    <header className="border-b border-gray-100/80 dark:border-gray-800/50 bg-background/90 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Link to="/dashboard" className="hidden items-center gap-2 md:flex">
          <motion.div 
            className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary/80 
                     flex items-center justify-center shadow-sm"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.span 
              className="text-white font-bold"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            >
              FP
            </motion.span>
          </motion.div>
          <motion.span 
            className="text-xl font-bold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentEmpresa?.nome || "FounderPilot AI"}
          </motion.span>
        </Link>
        
        <nav className="flex items-center gap-4 lg:gap-6 ml-6">
          <NavLink to="/dashboard" label="Dashboard">
            Dashboard
          </NavLink>
          <NavLink to="/open-finance" label="Open Finance">
            <div className="flex items-center gap-1">
              <BanknoteIcon className="h-4 w-4" />
              Open Finance
            </div>
          </NavLink>
          <NavLink to="/advisor" label="FounderPilot AI">
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              FounderPilot AI
            </div>
          </NavLink>
        </nav>
        
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover-lift micro-feedback"
              >
                <Avatar className="h-9 w-9 border border-primary/10">
                  <AvatarImage src="" alt={userDisplayName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/80 to-primary/60 text-white">
                    {getInitials(userDisplayName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 premium-card" align="end" forceMount>
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
                <Link to="/settings" className="cursor-pointer micro-feedback">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer micro-feedback"
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

// Componente de link de navegação com animação sutil
const NavLink = ({ to, label, children }: { to: string, label: string, children: React.ReactNode }) => {
  const isActive = window.location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors relative group ${
        isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
      }`}
      aria-label={label}
    >
      {children}
      <motion.div 
        className={`absolute bottom-[-2px] left-0 right-0 h-0.5 bg-primary/80 rounded-full ${
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        }`}
        layoutId="navIndicator"
        transition={{ duration: 0.3 }}
      />
    </Link>
  );
};
