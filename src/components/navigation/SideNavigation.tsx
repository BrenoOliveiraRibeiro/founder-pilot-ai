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
  ChevronRight,
  MenuIcon,
  X,
  PanelLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FounderPilotLogo } from "../shared/FounderPilotLogo";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("principal");

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileOpen(false);

    // Determine active section based on current path
    const currentItem = navItems.find(item => item.href === currentPath);
    if (currentItem?.group) {
      setActiveSection(currentItem.group);
    }
  }, [location]);

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

  // Animation variants
  const sidebarVariants = {
    expanded: { 
      width: "280px",
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    collapsed: { 
      width: "70px",
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const mobileMenuVariants = {
    open: { 
      x: 0,
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: { 
      x: "-100%",
      opacity: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const renderNavSection = (section: string) => {
    const items = groupedNavItems[section] || [];

    return (
      <div key={section} className="mb-2 px-2">
        {(expanded || isMobile) && (
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
            {groupLabels[section] || section}
          </h3>
        )}
        <ul className="space-y-1">
          {items.map((item) => (
            <motion.li 
              key={item.href}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm transition-all duration-200",
                  expanded || isMobile ? "px-3 py-2" : "p-2 justify-center",
                  currentPath === item.href 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                )}
                title={item.title}
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
                  {(expanded || isMobile) && <span>{item.title}</span>}
                </div>
                
                {(expanded || isMobile) && item.badge && (
                  <span className="px-1.5 py-0.5 text-xs rounded-md bg-red-500/20 text-red-600 dark:text-red-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Mobile sidebar toggle button
  const MobileToggle = () => (
    <button 
      className="fixed top-4 left-4 z-40 bg-background/80 backdrop-blur-sm border border-border p-2 rounded-md text-foreground"
      onClick={() => setMobileOpen(true)}
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );

  // Toggle button for expanded/collapsed states
  const ToggleButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-[-12px] h-6 w-6 rounded-full border border-border bg-card opacity-0 group-hover:opacity-100 transition-opacity z-10"
      onClick={() => setExpanded(!expanded)}
    >
      <ChevronRight className={cn("h-3 w-3", !expanded && "rotate-180")} />
    </Button>
  );

  const renderSidebarContent = () => (
    <>
      {/* Logo and Header */}
      <div className="p-4">
        <Link to="/" className="flex items-center justify-center mb-2">
          <div className="flex items-center gap-2">
            <FounderPilotLogo className="h-8 w-8 text-foreground" />
            {(expanded || isMobile) && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xl font-bold"
              >
                FounderPilot
              </motion.h1>
            )}
          </div>
        </Link>
      </div>

      {/* User Profile */}
      {currentEmpresa && (
        <div className="px-3 mb-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm rounded-md p-3">
            {(expanded || isMobile) ? (
              <>
                <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </>
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {currentEmpresa.nome.charAt(0)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="py-2">
          {/* Fixed Principal Section - Always Visible */}
          {renderNavSection('principal')}
          
          {/* Other Sections */}
          {Object.keys(groupedNavItems)
            .filter(group => group !== 'principal')
            .map(group => renderNavSection(group))
          }
        </div>
      </ScrollArea>

      {/* Footer with Connect Button and Sign Out */}
      <div className={cn("p-3 border-t border-border", !expanded && !isMobile && "p-2")}>
        {(expanded || isMobile) && (
          <Link 
            to="/connect"
            className="block mb-3"
          >
            <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-primary/3 backdrop-blur-sm p-3">
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
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full transition-all",
            expanded || isMobile 
              ? "justify-start text-muted-foreground hover:text-foreground/80" 
              : "p-2 h-auto aspect-square"
          )}
          onClick={handleSignOut}
          title="Sair"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {(expanded || isMobile) && "Sair"}
        </Button>
      </div>
    </>
  );

  // Mobile sidebar with overlay
  if (isMobile) {
    return (
      <>
        <MobileToggle />
        
        {/* Overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.aside 
              className="fixed left-0 top-0 bottom-0 z-50 bg-card border-r border-border w-[280px] flex flex-col h-screen overflow-hidden shadow-xl"
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
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
              {renderSidebarContent()}
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop sidebar
  return (
    <motion.aside 
      className="bg-card border-r border-border flex-shrink-0 h-screen flex flex-col overflow-hidden relative group shadow-sm"
      initial="expanded"
      animate={expanded ? "expanded" : "collapsed"}
      variants={sidebarVariants}
    >
      <ToggleButton />
      {renderSidebarContent()}
    </motion.aside>
  );
};
