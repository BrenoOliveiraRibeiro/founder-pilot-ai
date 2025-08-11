
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
  Users2,
  CreditCard,
  RefreshCw
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  badge?: string | React.ReactNode;
  badgeColor?: string;
  group?: string;
  disabled?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export type NavGroups = Record<string, NavItem[]>;

export const groupLabels: Record<string, string> = {
  "Principal": "Principal",
  "Análise": "Análise", 
  "Gestão": "Gestão",
  "Open Finance": "Open Finance"
};

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: HomeIcon,
    group: "Principal"
  },
  {
    title: "Saúde Financeira",
    href: "/finances",
    icon: DollarSign,
    group: "Principal"
  },
  {
    title: "Runway",
    href: "/runway",
    icon: TrendingUp,
    group: "Principal"
    // O badge será definido dinamicamente
  },
  {
    title: "Análise de Mercado", 
    href: "/market",
    icon: BarChart3,
    group: "Análise",
    disabled: true,
    badge: "Em breve"
  },
  {
    title: "Co-Founder AI",
    href: "/advisor",
    icon: Sparkles,
    highlight: true,
    group: "Análise"
  },
  {
    title: "Nova Conexão",
    href: "/pluggy",
    icon: CreditCard,
    group: "Open Finance"
  },
  {
    title: "Atualizar Conexão",
    href: "/pluggy-update",
    icon: RefreshCw,
    group: "Open Finance"
  },
  {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
    group: "Gestão",
    disabled: true,
    badge: "Em breve"
  },
  {
    title: "Calendário",
    href: "/calendar",
    icon: Calendar,
    group: "Gestão",
    disabled: true,
    badge: "Em breve"
  },
  {
    title: "Equipe",
    href: "/team",
    icon: Users2,
    group: "Gestão",
    disabled: true,
    badge: "Em breve"
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    group: "Gestão",
    disabled: true,
    badge: "Em breve"
  },
];

export const groupNavItems = (items: NavItem[]): NavGroups => {
  return items.reduce((groups, item) => {
    const group = item.group || 'outros';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {} as NavGroups);
};
