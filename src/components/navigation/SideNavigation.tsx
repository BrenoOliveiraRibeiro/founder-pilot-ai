
import React from "react";
import { Link } from "react-router-dom";
import { 
  BarChart3, 
  Brain, 
  Calendar, 
  DollarSign, 
  FileText, 
  HomeIcon, 
  Settings, 
  TrendingUp, 
  Users2 
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: HomeIcon },
  { title: "Financial Health", href: "/finances", icon: DollarSign },
  { title: "Runway Analysis", href: "/runway", icon: TrendingUp },
  { title: "AI Advisor", href: "/advisor", icon: Brain },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Market Data", href: "/market", icon: BarChart3 },
  { title: "Team", href: "/team", icon: Users2 },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Settings", href: "/settings", icon: Settings },
];

export const SideNavigation = () => {
  // Get current path for highlighting the active link
  const currentPath = window.location.pathname;

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">SC</span>
          </div>
          <h1 className="font-bold text-xl text-foreground">Sync AI</h1>
        </Link>
      </div>

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
        <div className="rounded-md bg-primary/5 p-3">
          <h3 className="font-medium text-sm text-primary mb-1">
            Connect your data
          </h3>
          <p className="text-xs text-foreground/70 mb-3">
            Link your financial accounts to unlock powerful insights
          </p>
          <Link 
            to="/connect"
            className="bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-md inline-flex items-center justify-center w-full font-medium"
          >
            Connect Accounts
          </Link>
        </div>
      </div>
    </aside>
  );
};
