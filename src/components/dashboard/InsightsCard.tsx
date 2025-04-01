
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  BarChart2, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp 
} from "lucide-react";

interface InsightItemProps {
  icon: React.ReactNode;
  title: string;
  status: "success" | "warning" | "danger" | "info";
}

const InsightItem = ({ icon, title, status }: InsightItemProps) => {
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
    <div className={`p-3 rounded-md border ${getStatusClasses()} flex items-center gap-3`}>
      {icon}
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
};

export const InsightsCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          AI-Generated Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <InsightItem
            icon={<TrendingDown className="h-4 w-4" />}
            title="Your engineering expenses are 30% higher than similar startups"
            status="danger"
          />
          
          <InsightItem
            icon={<AlertTriangle className="h-4 w-4" />}
            title="You may need to raise funds in the next 3 months based on current runway"
            status="warning"
          />
          
          <InsightItem
            icon={<TrendingUp className="h-4 w-4" />}
            title="Revenue growth is consistent with successful Seed to Series A transitions"
            status="success"
          />
          
          <InsightItem
            icon={<CheckCircle className="h-4 w-4" />}
            title="Your gross margin (68%) is better than industry average (55%)"
            status="success"
          />
        </div>
      </CardContent>
    </Card>
  );
};
