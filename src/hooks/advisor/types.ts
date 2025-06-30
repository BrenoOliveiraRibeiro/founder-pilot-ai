
export interface AdvisorChatUserData {
  empresaId?: string | null;
  empresaNome?: string | null;
  userNome?: string | null;
}

export interface TransactionData {
  total: number;
  recentes: any[];
  historicoCompleto: any[]; // Novo: histórico completo para a IA
  despesasPorCategoria: Record<string, number>;
  receitasPorMes: Record<string, number>;
  despesasPorMes: Record<string, number>; // Novo: análise de despesas por mês
  totalReceitas: number;
  totalDespesas: number;
  // Novas métricas avançadas
  tendencias: {
    receitaMedia3Meses: number;
    receitaMedia6Meses: number;
    despesaMedia3Meses: number;
    crescimentoReceitaTendencia: 'crescimento' | 'declinio';
  };
  recorrencia: {
    receitaRecorrente: number;
    despesaRecorrente: number;
    percentualReceitaRecorrente: number;
    percentualDespesaRecorrente: number;
  };
}

export interface FinancialContext {
  metrics: any;
  transacoes: TransactionData;
  alertas: {
    runwayCritico: boolean;
    burnRateAlto: boolean;
    crescimentoReceita: boolean;
  };
}

export interface AdvisorChatReturn {
  messages: any[];
  input: string;
  isLoading: boolean;
  isError: boolean;
  conversationHistory: boolean;
  suggestions: string[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleSendMessage: (e: React.FormEvent) => Promise<void>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSuggestionClick: (suggestion: string) => void;
  scrollToBottom: () => void;
  hasFinancialData: boolean;
  financialMetrics: any;
}
