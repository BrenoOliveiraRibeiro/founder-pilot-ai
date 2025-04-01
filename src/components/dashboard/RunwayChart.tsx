
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Sample data - in real app this would come from API
const data = [
  { month: "Jul", balance: 162700 },
  { month: "Aug", balance: 150000 },
  { month: "Sep", balance: 137300 },
  { month: "Oct", balance: 124500 },
  { month: "Nov", balance: 111800, future: true },
  { month: "Dec", balance: 99100, future: true },
  { month: "Jan", balance: 86400, future: true },
  { month: "Feb", balance: 73700, future: true },
  { month: "Mar", balance: 61000, future: true },
  { month: "Apr", balance: 48300, future: true },
  { month: "May", balance: 35600, future: true },
  { month: "Jun", balance: 22900, future: true },
  { month: "Jul", balance: 10200, future: true },
  { month: "Aug", balance: -2500, future: true },
];

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-sm p-2 text-sm">
        <p className="font-medium">{label}</p>
        <p className="text-primary">
          Balance: {formatCurrency(payload[0].value)}
        </p>
        {payload[0].payload.future && (
          <p className="text-xs text-muted-foreground mt-1">
            (Projected)
          </p>
        )}
      </div>
    );
  }

  return null;
};

export const RunwayChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Cash Runway Projection</span>
          <span className="text-sm font-normal text-destructive">
            Zero cash date: Aug 2024
          </span>
        </CardTitle>
        <CardDescription>
          Based on your current burn rate of $12,733/week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip content={<CustomTooltip />} />
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
        </div>
      </CardContent>
    </Card>
  );
};
