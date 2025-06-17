
export interface RunwayMetrics {
  cashReserve: number;
  burnRate: number;
  runwayMonths: number;
  estimatedRunoutDate: Date;
}

export interface RunwayProjectionData {
  month: string;
  cash: number;
}

export interface RunwaySimulationInputs {
  cashReserve: number;
  burnRate: number;
  revenueIncrease: number;
  costReduction: number;
  addFunding: number;
}

export interface RunwayRecommendation {
  type: 'cost_reduction' | 'revenue_growth' | 'funding' | 'emergency';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact?: string;
}

export interface RunwayAlertLevel {
  level: 'critical' | 'warning' | 'good';
  message: string;
  color: string;
}
