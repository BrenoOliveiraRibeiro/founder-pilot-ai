
import { Message } from "@/components/advisor/ChatMessage";

export interface AdvisorChatUserData {
  empresaId?: string | null;
  empresaNome?: string | null;
  userNome?: string | null;
}

export interface FinancialContext {
  metrics: any;
  transacoes: {
    total: number;
    recentes: any[];
    despesasPorCategoria: Record<string, number>;
    receitasPorMes: Record<string, number>;
    totalReceitas: number;
    totalDespesas: number;
  };
  alertas: {
    runwayCritico: boolean;
    burnRateAlto: boolean;
    crescimentoReceita: boolean;
  };
}

export interface AdvisorChatReturn {
  messages: Message[];
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
