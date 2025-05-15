
import React from "react";
import { motion } from "framer-motion";

interface InsightItemProps {
  icon: React.ReactNode;
  title: string;
  status: "success" | "warning" | "danger" | "info";
  index: number;
}

export const InsightItem = ({ icon, title, status, index }: InsightItemProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case "success":
        return "bg-success/10 text-success border-success/20";
      case "warning":
        return "bg-warning/10 text-warning border-warning/20";
      case "danger":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
      className={`p-3 rounded-md border ${getStatusClasses()} flex items-center gap-3`}
    >
      {icon}
      <p className="text-sm font-medium">{title}</p>
    </motion.div>
  );
};
