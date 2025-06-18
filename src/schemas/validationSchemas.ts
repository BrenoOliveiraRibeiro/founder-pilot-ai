
import { z } from "zod";

// Schema para dados financeiros básicos
export const financeDataSchema = z.object({
  saldoCaixa: z.number().min(0, "Saldo deve ser positivo"),
  entradasMesAtual: z.number().min(0, "Entradas devem ser positivas"),
  saidasMesAtual: z.number().min(0, "Saídas devem ser positivas"),
  fluxoCaixaMesAtual: z.number(),
});

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

// Schema para simulação de runway - agora com campos obrigatórios
export const runwaySimulationSchema = z.object({
  cashReserve: z.number().min(0, "Reserva de caixa deve ser positiva"),
  burnRate: z.number().min(0, "Burn rate deve ser positivo"),
  revenueIncrease: z.number().min(0).max(100, "Aumento de receita deve estar entre 0% e 100%"),
  costReduction: z.number().min(0).max(100, "Redução de custos deve estar entre 0% e 100%"),
  addFunding: z.number().min(0, "Captação adicional deve ser positiva"),
});

// Schema para empresa
export const empresaSchema = z.object({
  id: z.string().uuid("ID da empresa deve ser um UUID válido"),
  nome: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  segmento: z.string().optional(),
  estagio: z.string().optional(),
  num_funcionarios: z.number().int().positive().optional(),
  data_fundacao: z.string().optional(),
  website: z.string().url("Website deve ser uma URL válida").optional(),
});

// Schema para perfil de usuário
export const profileSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cargo: z.string().min(2, "Cargo deve ter pelo menos 2 caracteres"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  avatar_url: z.string().url("URL do avatar deve ser válida").optional(),
});

// Tipos derivados dos schemas
export type FinanceData = z.infer<typeof financeDataSchema>;
export type OpenFinanceMetrics = z.infer<typeof openFinanceMetricsSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type AccountData = z.infer<typeof accountDataSchema>;
export type PluggyConnection = z.infer<typeof pluggyConnectionSchema>;
export type RunwaySimulation = z.infer<typeof runwaySimulationSchema>;
export type Empresa = z.infer<typeof empresaSchema>;
export type Profile = z.infer<typeof profileSchema>;
