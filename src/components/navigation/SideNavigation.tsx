
import React from "react";
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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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

  // Agrupar itens de navegação
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
          <h1 className="text-xl font-bold">FounderPilot</h1>
        </Link>
      </div>

      {currentEmpresa && (
        <div className="px-3 mb-4">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm rounded-md p-3">
            <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-none">
        {Object.entries(groupedNavItems).map(([group, items]) => (
          <div key={group} className="mb-4">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
              {groupLabels[group] || group}
            </h4>
            <ul className="space-y-1">
              {items.map((item) => (
                <motion.li 
                  key={item.href}
                  whileHover={{ x: 3 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300",
                      currentPath === item.href 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                    )}
                    title={item.title}
                  >
                    <div className="flex items-center gap-3">
                      {item.highlight ? (
                        <span className="relative">
                          <item.icon className="h-4 w-4" />
                          <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse-subtle" />
                        </span>
                      ) : (
                        <item.icon className="h-4 w-4" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-xs rounded-md bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse-subtle">
                        {item.badge}
                      </span>
                    )}
                    
                    {currentPath === item.href && (
                      <ChevronRight className="h-4 w-4 text-primary ml-auto" />
                    )}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-primary/3 backdrop-blur-sm p-3 mb-3">
          <h3 className="font-medium text-sm text-primary mb-1 flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5 animate-pulse-subtle"></span>
            Conecte seus dados
          </h3>
          <p className="text-xs text-foreground/70 mb-3 leading-relaxed">
            Vincule suas contas financeiras para desbloquear insights mais precisos
          </p>
          <Link 
            to="/open-finance"
            className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs px-3 py-1.5 rounded-md inline-flex items-center justify-center w-full font-medium transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm"
          >
            Conectar Open Finance
          </Link>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-muted-foreground hover:text-foreground/80"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </motion.aside>
  );
};
