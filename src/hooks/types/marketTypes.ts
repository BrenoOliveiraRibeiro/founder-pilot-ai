
export interface MarketFormData {
  segment: string;
  region: string;
  customerType: 'B2B' | 'B2C' | 'PME' | 'Enterprise';
}

export interface TamSamSomData {
  label: string;
  value: number;
  description: string;
  color: string;
}

export interface CompetitorData {
  name: string;
  marketShare: number;
  funding: number;
  employees: number;
  description: string;
}

export interface MarketInsight {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface MarketAnalysisData {
  tamSamSom: TamSamSomData[];
  competitors: CompetitorData[];
  insights: MarketInsight[];
  growthProjection: {
    year: number;
    projection: number;
  }[];
  entryBarriers: {
    barrier: string;
    difficulty: 'high' | 'medium' | 'low';
    description: string;
  }[];
}

export interface MarketAnalysisState {
  segment: string;
  region: string;
  customerType: string;
  isLoading: boolean;
  hasAnalysis: boolean;
  aiEnriched: boolean;
  rawAiData: any;
  analysisData: MarketAnalysisData | null;
  currentTab: string;
}

export interface MarketAnalysisReturn extends MarketAnalysisState {
  setSegment: (segment: string) => void;
  setRegion: (region: string) => void;
  setCustomerType: (type: string) => void;
  setCurrentTab: (tab: string) => void;
  handleAnalyze: () => Promise<void>;
  resetAnalysis: () => void;
  tamSamSomData: TamSamSomData[];
  competitorsData: CompetitorData[];
  insights: MarketInsight[];
  growthProjection: MarketAnalysisData['growthProjection'];
  entryBarriers: MarketAnalysisData['entryBarriers'];
  empresaData: any;
}
