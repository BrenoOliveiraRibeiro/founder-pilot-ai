import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  FileText, 
  HomeIcon, 
  LogOut,
  Settings, 
  Sparkles, 
  TrendingUp, 
  Users2,
  MenuIcon,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { FounderPilotLogo } from "../shared/FounderPilotLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
  group?: string;
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: HomeIcon, group: "principal" },
  { title: "Finanças", href: "/finances", icon: DollarSign, highlight: true, group: "principal" },
  { title: "Runway", href: "/runway", icon: TrendingUp, badge: "Crítico", group: "principal" },
  { title: "FounderPilot", href: "/advisor", icon: Sparkles, highlight: true, group: "principal" },
  { title: "Relatórios", href: "/reports", icon: FileText, group: "análise" },
  { title: "Mercado", href: "/market", icon: BarChart3, group: "análise" },
  { title: "Equipe", href: "/team", icon: Users2, group: "gestão" },
  { title: "Agenda", href: "/calendar", icon: Calendar, group: "gestão" },
  { title: "Config.", href: "/settings", icon: Settings, group: "sistema" },
];

export const SideNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, currentEmpresa, profile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Group navigation items by their group
  const groupedNavItems = navItems.reduce((groups, item) => {
    const group = item.group || 'outros';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as Record<string, NavItem[]>);

  const groupLabels: Record<string, string> = {
    principal: "Principal",
    análise: "Análise de Dados",
    gestão: "Gestão",
    sistema: "Sistema"
  };

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

  // Mobile sidebar
  if (isMobile) {
    return <MobileSidebar 
      currentPath={currentPath}
      currentEmpresa={currentEmpresa}
      profile={profile}
      groupedNavItems={groupedNavItems}
      groupLabels={groupLabels}
      handleSignOut={handleSignOut}
    />;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar variant="sidebar" side="left">
        <SidebarHeader className="px-2 py-2">
          <Link to="/" className="flex items-center gap-2 px-2">
            <FounderPilotLogo className="h-8 w-8 text-foreground" />
            <span className="text-xl font-bold">FounderPilot</span>
          </Link>
          
          {currentEmpresa && (
            <div className="px-2 mt-2">
              <div className="bg-primary/10 rounded-md p-3">
                <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>
          )}
        </SidebarHeader>

        <SidebarContent className="flex flex-col overflow-hidden">
          {/* Principal section - Always visible, fixed at the top */}
          <div className="sticky top-0 z-10 bg-sidebar pt-1 pb-2">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 mb-1">Principal</SidebarGroupLabel>
              <SidebarMenu>
                {groupedNavItems['principal'].map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={currentPath === item.href}
                      tooltip={item.title}
                    >
                      <Link to={item.href} className="group flex items-center gap-3 w-full">
                        <div className="relative">
                          <item.icon className="h-4 w-4" />
                          {item.highlight && (
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                        <span>{item.title}</span>
                        {item.badge && (
                          <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-600 dark:text-red-400">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
            {/* Divider after Principal section */}
            <div className="mx-3 my-1 h-px bg-border opacity-50"></div>
          </div>

          {/* Scrollable area for other sections */}
          <div className="overflow-y-auto flex-1 pb-2">
            {/* Other sections */}
            {Object.keys(groupedNavItems)
              .filter(group => group !== 'principal')
              .map(group => (
                <SidebarGroup key={group}>
                  <SidebarGroupLabel className="px-3 mb-1 mt-1">{groupLabels[group] || group}</SidebarGroupLabel>
                  <SidebarMenu>
                    {groupedNavItems[group].map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton 
                          asChild
                          isActive={currentPath === item.href}
                          tooltip={item.title}
                        >
                          <Link to={item.href} className="group flex items-center gap-3 w-full">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              ))
            }
          </div>
        </SidebarContent>

        <SidebarFooter>
          <div className="px-3 pb-3">
            <Link to="/connect" className="block mb-3">
              <div className="rounded-lg bg-primary/10 p-3">
                <h3 className="font-medium text-sm text-primary mb-1 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                  Conecte seus dados
                </h3>
                <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
                  Vincule suas contas financeiras para insights precisos
                </p>
                <Button 
                  variant="default"
                  size="sm" 
                  className="w-full bg-primary text-xs px-3 py-1.5 rounded-md inline-flex items-center justify-center font-medium"
                >
                  Conectar Open Finance
                </Button>
              </div>
            </Link>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-muted-foreground hover:text-foreground/80"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
};

// Separate component for mobile sidebar
const MobileSidebar = ({ 
  currentPath, 
  currentEmpresa, 
  profile, 
  groupedNavItems, 
  groupLabels, 
  handleSignOut 
}: {
  currentPath: string;
  currentEmpresa: any;
  profile: any;
  groupedNavItems: Record<string, NavItem[]>;
  groupLabels: Record<string, string>;
  handleSignOut: () => void;
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileOpen(false);
  }, [currentPath]);

  return (
    <>
      <button 
        className="fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-sm border border-border p-2 rounded-md text-foreground"
        onClick={() => setMobileOpen(true)}
      >
        <MenuIcon className="h-5 w-5" />
      </button>
      
      {/* Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <motion.aside 
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border w-[280px] flex flex-col h-screen overflow-hidden shadow-xl",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        animate={{ x: mobileOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <FounderPilotLogo className="h-8 w-8 text-foreground" />
            <span className="text-xl font-bold">FounderPilot</span>
          </Link>
        </div>

        {currentEmpresa && (
          <div className="px-3 py-3 border-b border-border">
            <div className="bg-primary/10 rounded-md p-3">
              <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          <div className="space-y-4">
            {/* Principal Section - Sticky position */}
            <div className="sticky top-0 z-10 bg-card px-2 pb-2">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
                {groupLabels['principal']}
              </h3>
              <ul className="space-y-1">
                {groupedNavItems['principal'].map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md text-sm px-3 py-2",
                        currentPath === item.href 
                          ? "bg-primary/10 text-primary font-medium" 
                          : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full">
                        {item.highlight ? (
                          <span className="relative">
                            <item.icon className="h-4 w-4" />
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full" />
                          </span>
                        ) : (
                          <item.icon className="h-4 w-4" />
                        )}
                        <span>{item.title}</span>
                      </div>
                      
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-xs rounded-md bg-red-500/20 text-red-600 dark:text-red-400">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Divider after Principal section */}
              <div className="mx-2 my-2 h-px bg-border opacity-50"></div>
            </div>
            
            {/* Other Sections */}
            {Object.keys(groupedNavItems)
              .filter(group => group !== 'principal')
              .map(group => (
                <div key={group} className="px-2">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
                    {groupLabels[group] || group}
                  </h3>
                  <ul className="space-y-1">
                    {groupedNavItems[group].map((item) => (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md text-sm px-3 py-2",
                            currentPath === item.href 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            }
          </div>
        </div>

        <div className="p-3 border-t border-border">
          <Link to="/connect" className="block mb-3">
            <div className="rounded-lg bg-primary/10 p-3">
              <h3 className="font-medium text-sm text-primary mb-1 flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5"></span>
                Conecte seus dados
              </h3>
              <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
                Vincule suas contas financeiras para insights precisos
              </p>
              <Button 
                variant="default"
                size="sm" 
                className="w-full bg-primary text-xs py-1.5 rounded-md inline-flex items-center justify-center font-medium"
              >
                Conectar Open Finance
              </Button>
            </div>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-muted-foreground hover:text-foreground/80"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </motion.aside>
    </>
  );
};
