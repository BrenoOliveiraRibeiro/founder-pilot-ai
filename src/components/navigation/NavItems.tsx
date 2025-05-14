
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
