
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

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  change?: number;
  icon: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  description,
  change,
  icon,
  tooltip,
  className,
}: MetricCardProps) => {
  return (
    <div className={cn("bg-card rounded-lg border p-6", className)}>
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
        <h2 className="text-2xl font-bold tracking-tight">{value}</h2>
        {(description || typeof change !== 'undefined') && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>
    </div>
  );
};
