
import { z } from "zod";

// Schema para métricas do Open Finance
export const openFinanceMetricsSchema = z.object({
  saldoTotal: z.number(),
  receitaMensal: z.number().min(0, "Receita deve ser positiva"),
  despesasMensais: z.number().min(0, "Despesas devem ser positivas"),
  runwayMeses: z.number().min(0, "Runway deve ser positivo"),
  fluxoCaixa: z.number(),
  burnRate: z.number().min(0, "Burn rate deve ser positivo"),
  integracoesAtivas: z.number().int().min(0, "Integrações ativas deve ser um número inteiro positivo"),
  alertaCritico: z.boolean(),
  ultimaAtualizacao: z.string().optional(),
});

// Schema para dados de transação
export const transactionSchema = z.object({
  id: z.string(),
  valor: z.number(),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  data_transacao: z.string().or(z.date()),
  categoria: z.string().optional(),
  tipo: z.enum(['entrada', 'saida']),
});

// Schema para dados de conta bancária
export const accountDataSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome da conta é obrigatório"),
  type: z.string(),
  balance: z.number(),
  currency: z.string().default('BRL'),
});

// Schema para dados de conexão Pluggy
export const pluggyConnectionSchema = z.object({
  itemId: z.string().min(1, "Item ID é obrigatório"),
  accountData: z.any(),
  transactionsData: z.any().optional(),
  isConnected: z.boolean(),
  connectionToken: z.string().optional(),
});

// Tipos derivados dos schemas
export type OpenFinanceMetrics = z.infer<typeof openFinanceMetricsSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type AccountData = z.infer<typeof accountDataSchema>;
export type PluggyConnection = z.infer<typeof pluggyConnectionSchema>;
