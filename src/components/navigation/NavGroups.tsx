
import React from "react";
import { useLocation } from "react-router-dom";
import { NavItemComponent } from "./NavItems";
import { NavItem } from "./types";
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
import { useOpenFinanceDashboard } from "@/hooks/useOpenFinanceDashboard";
import { useTransactionsMetrics } from "@/hooks/useTransactionsMetrics";

export const NavGroups: React.FC = () => {
  const location = useLocation();
  const { metrics } = useOpenFinanceDashboard();
  const { saldoCaixa, saidasMesAtual } = useTransactionsMetrics();

  // Calcular runway real
  const hasOpenFinanceData = metrics && metrics.integracoesAtivas > 0;
  const runway = hasOpenFinanceData 
    ? metrics.runwayMeses 
    : (saidasMesAtual > 0 ? saldoCaixa / saidasMesAtual : 0);

  const isRunwayCritical = runway > 0 && runway < 3; // Só crítico se há dados reais e < 3 meses

  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: HomeIcon
    },
    {
      title: "Advisor AI",
      href: "/advisor",
      icon: Sparkles,
      highlight: true
    },
    {
      title: "Finanças",
      href: "/finances",
      icon: DollarSign
    },
    {
      title: "Runway",
      href: "/runway",
      icon: TrendingUp,
      badge: isRunwayCritical ? "Crítico" : undefined
    },
    {
      title: "Mercado",
      href: "/market",
      icon: BarChart3
    },
    {
      title: "Relatórios",
      href: "/reports",
      icon: FileText
    },
    {
      title: "Time",
      href: "/team",
      icon: Users2
    },
    {
      title: "Agenda",
      href: "/calendar",
      icon: Calendar
    },
    {
      title: "Configurações",
      href: "/settings",
      icon: Settings
    }
  ];

  return (
    <nav className="space-y-1">
      <ul className="space-y-1">
        {navigationItems.map((item) => (
          <NavItemComponent
            key={item.href}
            item={item}
            isActive={location.pathname === item.href}
          />
        ))}
      </ul>
    </nav>
  );
};
