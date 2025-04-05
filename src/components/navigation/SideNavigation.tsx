
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
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { title: "Saúde Financeira", href: "/finances", icon: DollarSign, highlight: true },
  { title: "Análise de Runway", href: "/runway", icon: TrendingUp, badge: "Crítico" },
  { title: "FounderPilot AI", href: "/advisor", icon: Sparkles, highlight: true },
  { title: "Relatórios", href: "/reports", icon: FileText },
  { title: "Dados de Mercado", href: "/market", icon: BarChart3 },
  { title: "Equipe", href: "/team", icon: Users2 },
  { title: "Calendário", href: "/calendar", icon: Calendar },
  { title: "Configurações", href: "/settings", icon: Settings },
];

export const SideNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, currentEmpresa, profile } = useAuth();
  const { toast } = useToast();

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
        <Link to="/" className="flex items-center gap-2 group hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center relative overflow-hidden">
            <motion.span 
              className="text-primary-foreground font-bold"
              animate={{ y: [0, -1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
            >
              FP
            </motion.span>
            <motion.div 
              className="absolute inset-0 bg-white/20"
              initial={{ y: "100%" }}
              animate={{ y: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
            />
          </div>
          <h1 className="font-bold text-xl text-foreground">FounderPilot AI</h1>
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
        <ul className="space-y-1">
          {navItems.map((item) => (
            <motion.li 
              key={item.href}
              whileHover={{ x: 3 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-300",
                  currentPath === item.href 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                )}
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
