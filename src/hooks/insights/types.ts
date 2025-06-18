
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

// Type for creating new insights - all required fields must be present
export type InsightInsert = Omit<Insight, 'id' | 'data_criacao' | 'data_resolucao'> & {
  data_resolucao?: string | null;
};

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
