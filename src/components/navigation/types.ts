
import { type ReactElement } from "react";
import { 
  HomeIcon, 
  DollarSign, 
  TrendingUp, 
  Sparkles, 
  FileText, 
  BarChart3, 
  Users2, 
  Calendar, 
  Settings 
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  highlight?: boolean;
  group?: string;
};

export type NavGroups = Record<string, NavItem[]>;

export const groupLabels: Record<string, string> = {
  principal: "Principal",
  análise: "Análise de Dados",
  gestão: "Gestão",
  sistema: "Sistema"
};

export const navItems: NavItem[] = [
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
