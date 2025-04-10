
import React from "react";
import { formatCurrency } from "../utils/formatters";

interface CustomPieTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const CustomPieTooltip: React.FC<CustomPieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded-md shadow-md">
        <p className="font-medium">{data.name}: {formatCurrency(data.value)}</p>
        <p className="text-xs text-muted-foreground">{data.description}</p>
      </div>
    );
  }
  return null;
};
