
import { Insight } from "@/integrations/supabase/models";

export interface FinancialMetrics {
  caixaAtual: number;
  receitaMensal: number;
  burnRate: number;
  runwayMeses: number;
}

export interface InsightGenerationData {
  empresaId: string;
  metricas?: any;
  transacoes?: any[];
}

export interface UseInsightsReturn {
  insights: Insight[];
  loading: boolean;
  syncingData: boolean;
  testingConnection: boolean;
  testResult: any;
  error: string | null;
  fetchInsights: () => Promise<void>;
  syncMarketData: () => Promise<void>;
  testBelvoConnection: () => Promise<void>;
  generateRealTimeInsights: () => Promise<void>;
}
