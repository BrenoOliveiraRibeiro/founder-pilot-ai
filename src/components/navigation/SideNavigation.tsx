
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  DollarSign, 
  FileText, 
  HomeIcon, 
  LogOut,
  Settings, 
  TrendingUp, 
  Users2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { title: "Saúde Financeira", href: "/finances", icon: DollarSign },
  { title: "Análise de Runway", href: "/runway", icon: TrendingUp },
  { title: "FounderPilot AI", href: "/advisor", icon: Brain },
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

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">FP</span>
          </div>
          <h1 className="font-bold text-xl text-foreground">FounderPilot AI</h1>
        </Link>
      </div>

      {currentEmpresa && (
        <div className="px-3 mb-4">
          <div className="bg-primary/5 rounded-md p-3">
            <h3 className="font-medium text-sm truncate">{currentEmpresa.nome}</h3>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-2">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  currentPath === item.href 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "text-foreground/60 hover:text-foreground hover:bg-accent/10"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <div className="rounded-md bg-primary/5 p-3 mb-3">
          <h3 className="font-medium text-sm text-primary mb-1">
            Conecte seus dados
          </h3>
          <p className="text-xs text-foreground/70 mb-3">
            Vincule suas contas financeiras para desbloquear insights poderosos
          </p>
          <Link 
            to="/open-finance"
            className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md inline-flex items-center justify-center w-full font-medium"
          >
            Conectar Open Finance
          </Link>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
};
