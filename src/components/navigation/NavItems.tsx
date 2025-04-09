
import React from "react";
import { Link } from "react-router-dom";
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
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./types";

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
}

const iconComponents: Record<string, React.ElementType> = {
  HomeIcon,
  DollarSign,
  TrendingUp,
  Sparkles,
  FileText,
  BarChart3,
  Users2,
  Calendar,
  Settings
};

export const NavItemComponent: React.FC<NavItemProps> = ({ item, isActive }) => {
  const IconComponent = iconComponents[item.icon] || item.icon;
  
  return (
    <motion.li 
      whileHover={{ x: 3 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={item.href}
        className={cn(
          "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300",
          isActive 
            ? "bg-primary/10 text-primary font-medium" 
            : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
        )}
        title={item.title}
      >
        <div className="flex items-center gap-3">
          {item.highlight ? (
            <span className="relative">
              <IconComponent className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse-subtle" />
            </span>
          ) : (
            <IconComponent className="h-4 w-4" />
          )}
          <span>{item.title}</span>
        </div>
        
        {item.badge && (
          <span className="px-1.5 py-0.5 text-xs rounded-md bg-red-500/20 text-red-600 dark:text-red-400 animate-pulse-subtle">
            {item.badge}
          </span>
        )}
        
        {isActive && (
          <ChevronRight className="h-4 w-4 text-primary ml-auto" />
        )}
      </Link>
    </motion.li>
  );
};
