
import React from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceArea,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface RunwayChartVisualizationProps {
  loading: boolean;
  cashRunway: any[];
  criticalZoneIndex: number;
  zeroCashIndex: number;
}

export const RunwayChartVisualization: React.FC<RunwayChartVisualizationProps> = ({
  loading,
  cashRunway,
  criticalZoneIndex,
  zeroCashIndex
}) => {
  const animationVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.8,
        delay: 0.3
      }
    }
  };

  if (loading) {
    return (
      <div className="h-80">
        <Skeleton className="w-full h-full">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-muted-foreground/10 to-transparent animate-shimmer"></div>
        </Skeleton>
      </div>
    );
  }

  return (
    <motion.div 
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      className="h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={cashRunway}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tickFormatter={(value) => `R$${Math.abs(value / 1000)}k`}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Zone de risco (runway < 3 meses) */}
          {criticalZoneIndex > 0 && (
            <ReferenceArea 
              x1={cashRunway[criticalZoneIndex]?.month} 
              x2={cashRunway[zeroCashIndex > 0 ? zeroCashIndex : cashRunway.length - 1]?.month}
              y1={0}
              y2="dataMax"
              fill="hsl(var(--destructive))"
              fillOpacity={0.1}
              stroke="hsl(var(--destructive))"
              strokeOpacity={0.3}
              strokeDasharray="3 3"
            />
          )}
          
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(var(--primary))"
            fillOpacity={1}
            fill="url(#colorBalance)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
