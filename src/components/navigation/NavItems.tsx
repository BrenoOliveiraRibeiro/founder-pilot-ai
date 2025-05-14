
import { 
  Home, 
  BookOpen, 
  Layers, 
  CalendarDays, 
  Users, 
  BarChart3, 
  FileText, 
  Wallet, 
  Timer, 
  Settings,
  ServerCog
} from "lucide-react";
import React from 'react';
import { Link } from "react-router-dom";
import { NavItem } from './types';
import { cn } from "@/lib/utils";

export const MAIN_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "AI Advisor",
    href: "/advisor",
    icon: BookOpen,
  },
  {
    title: "Open Finance",
    href: "/open-finance",
    icon: Layers,
  },
  {
    title: "N8N Integration",
    href: "/n8n",
    icon: ServerCog,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
  }
];

export const ANALYTICS_NAV_ITEMS = [
  {
    title: "Market",
    href: "/market",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Finance",
    href: "/finances",
    icon: Wallet,
  },
  {
    title: "Runway",
    href: "/runway",
    icon: Timer,
  }
];

export const SETTINGS_NAV_ITEMS = [
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export const NavItemComponent: React.FC<{ 
  item: NavItem; 
  isActive: boolean;
}> = ({ item, isActive }) => {
  return (
    <li>
      <Link
        to={item.href}
        className={cn(
          "flex items-center px-3 py-2 hover:bg-muted hover:text-foreground rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
            : "text-muted-foreground"
        )}
      >
        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
        {item.title}
      </Link>
    </li>
  );
};
