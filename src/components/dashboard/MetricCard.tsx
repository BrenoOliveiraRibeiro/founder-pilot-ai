
import React from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  HelpCircle 
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  change?: number;
  icon: React.ReactNode;
  tooltip?: string;
  className?: string;
  loading?: boolean;
}

export const MetricCard = ({
  title,
  value,
  description,
  change,
  icon,
  tooltip,
  className,
  loading = false,
}: MetricCardProps) => {
  return (
    <div className={cn("bg-card rounded-lg border p-6 overflow-hidden", className)}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-foreground/80">{title}</h3>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-64 text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        {loading ? (
          <>
            <div className="h-8 flex items-center">
              <Skeleton className="h-8 w-28 mb-2">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
              </Skeleton>
            </div>
            {(description || typeof change !== 'undefined') && (
              <div className="h-4 flex items-center">
                <Skeleton className="h-4 w-20">
                  <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer" />
                </Skeleton>
              </div>
            )}
          </>
        ) : (
          <>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl font-bold tracking-tight"
            >
              {value}
            </motion.h2>
            {(description || typeof change !== 'undefined') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center gap-2"
              >
                {typeof change !== 'undefined' && (
                  <span
                    className={cn(
                      "text-xs font-medium inline-flex items-center",
                      change > 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(change)}%
                  </span>
                )}
                {description && (
                  <span className="text-xs text-muted-foreground">
                    {description}
                  </span>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
