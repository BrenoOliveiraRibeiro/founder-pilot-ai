
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
import { motion } from "framer-motion";
import { useRunwayStatus } from "@/hooks/useRunwayStatus";

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
}

export const NavItemComponent: React.FC<NavItemProps> = ({ item, isActive }) => {
  const IconComponent = item.icon;
  const runwayStatus = useRunwayStatus();
  
  // Aplicar badge dinâmico para o item Runway
  const dynamicBadge = item.href === '/runway' ? runwayStatus.label : item.badge;
  const badgeColor = item.href === '/runway' ? runwayStatus.color : undefined;
  
  // Se o item está desabilitado, renderizar como span não clicável
  if (item.disabled) {
    return (
      <motion.li 
        whileHover={{ x: 3 }}
        transition={{ duration: 0.2 }}
      >
        <span
          className={cn(
            "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm transition-all duration-300",
            "text-foreground/40 cursor-not-allowed opacity-60"
          )}
          title={`${item.title} - Em breve`}
        >
          <div className="flex items-center gap-3">
            <IconComponent className="h-4 w-4" />
            <span>{item.title}</span>
          </div>
          
          {item.badge && (
            <span className="px-1.5 py-0.5 text-xs rounded-md font-medium bg-amber-500/20 text-amber-600 dark:text-amber-400">
              {item.badge}
            </span>
          )}
        </span>
      </motion.li>
    );
  }
  
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
        
        {dynamicBadge && (
          <span className={cn(
            "px-1.5 py-0.5 text-xs rounded-md font-medium",
            badgeColor || "bg-red-500/20 text-red-600 dark:text-red-400",
            item.href === '/runway' && !runwayStatus.hasRealData && "animate-pulse-subtle"
          )}>
            {dynamicBadge}
          </span>
        )}
        
        {isActive && (
          <ChevronRight className="h-4 w-4 text-primary ml-auto" />
        )}
      </Link>
    </motion.li>
  );
};
