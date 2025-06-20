import React from "react";
import { 
  BarChart3, 
  Calendar, 
  DollarSign, 
  FileText, 
  HomeIcon, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  Users2 
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string | React.ReactNode;
  badgeColor?: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type NavGroups = Record<string, NavItem[]>;

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
  },
  {
    title: "Saúde Financeira",
    href: "/finances",
    icon: DollarSign,
  },
  {
    title: "Runway",
    href: "/runway",
    icon: TrendingUp,
    // O badge será definido dinamicamente
  },
  {
    title: "Análise de Mercado", 
    href: "/market",
    icon: BarChart3,
  },
  {
    title: "Co-Founder AI",
    href: "/advisor",
    icon: Sparkles,
    highlight: true,
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Calendário",
    href: "/calendar",
    icon: Calendar,
  },
  {
    title: "Equipe",
    href: "/team",
    icon: Users2,
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export const groupNavItems = (items: NavItem[]): NavGroups => {
  return {
    "Principal": items.slice(0, 3),
    "Análise": items.slice(3, 5),
    "Gestão": items.slice(5)
  };
};
