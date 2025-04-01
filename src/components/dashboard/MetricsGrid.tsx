
import React from "react";
import { MetricCard } from "./MetricCard";
import { 
  BanknoteIcon, 
  CalendarClock, 
  CreditCard, 
  DollarSign, 
  LineChart, 
  TrendingDown, 
  Wallet 
} from "lucide-react";

export const MetricsGrid = () => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
      <MetricCard
        title="Cash Balance"
        value="$124,500"
        description="Total available"
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        tooltip="Your total cash balance across all connected accounts"
      />
      
      <MetricCard
        title="Monthly Revenue"
        value="$45,800"
        change={12}
        description="vs. last month"
        icon={<BanknoteIcon className="h-5 w-5 text-primary" />}
        tooltip="Your total revenue for the current month"
      />
      
      <MetricCard
        title="Monthly Burn"
        value="$38,200"
        change={-8}
        description="vs. last month"
        icon={<CreditCard className="h-5 w-5 text-primary" />}
        tooltip="Your total expenses for the current month"
      />
      
      <MetricCard
        title="Runway"
        value="3.5 months"
        change={-15}
        description="at current burn rate"
        icon={<CalendarClock className="h-5 w-5 text-warning" />}
        tooltip="How long your cash will last at the current burn rate"
        className="border-warning/20 bg-warning/5"
      />
      
      <MetricCard
        title="MRR Growth"
        value="12.5%"
        change={3.2}
        description="vs. last month"
        icon={<LineChart className="h-5 w-5 text-success" />}
        tooltip="Month-over-month growth in recurring revenue"
        className="border-success/20 bg-success/5"
      />
      
      <MetricCard
        title="Burn Rate"
        value="$12,733"
        description="weekly average"
        icon={<TrendingDown className="h-5 w-5 text-destructive" />}
        tooltip="Your average weekly spending rate"
        className="border-destructive/20 bg-destructive/5"
      />
      
      <MetricCard
        title="Cash Flow"
        value="$7,600"
        change={-22}
        description="vs. last month"
        icon={<Wallet className="h-5 w-5 text-primary" />}
        tooltip="Net cash flow (revenue minus expenses)"
      />
    </div>
  );
};
