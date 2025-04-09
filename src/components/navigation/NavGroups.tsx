
import React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { NavItem, NavGroups, groupLabels } from "./types";
import { NavItemComponent } from "./NavItems";

interface NavGroupsProps {
  groupedItems: NavGroups;
}

export const NavGroupsList: React.FC<NavGroupsProps> = ({ groupedItems }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <>
      {Object.entries(groupedItems).map(([group, items]) => (
        <div key={group} className="mb-4">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-1">
            {groupLabels[group] || group}
          </h4>
          <ul className="space-y-1">
            {items.map((item) => (
              <NavItemComponent 
                key={item.href} 
                item={item} 
                isActive={currentPath === item.href} 
              />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
};
